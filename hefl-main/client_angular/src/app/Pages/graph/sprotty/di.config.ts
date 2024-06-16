import { Container, ContainerModule } from 'inversify';
import {
    configureModelElement, configureViewerOptions, loadDefaultModules, LocalModelSource,
    PolylineEdgeView, SCompartmentView, SCompartmentImpl, SEdgeImpl, SGraphImpl, SGraphView, SLabelImpl, SLabelView,
    SNodeImpl, TYPES, RectangularNode, expandFeature, nameFeature, SButtonImpl, ExpandButtonView,
    configureButtonHandler, SRoutingHandleImpl, SRoutingHandleView, SModelElementImpl, SPortImpl, ConsoleLogger,
    LogLevel, IContextMenuServiceProvider, contextMenuModule, ContextMenuProviderRegistry
} from 'sprotty';
import { ConceptNodeView, CustomCollapseExpandView, HeaderLabelView, MiniConceptView, PortViewWithExternalLabel, TextLabelView } from './views';
import { ConceptGraphModelSource } from './model-source';
import ElkConstructor, { LayoutOptions } from 'elkjs';
import {
    DefaultLayoutConfigurator, ElkFactory, ElkLayoutEngine, ILayoutConfigurator, elkLayoutModule
} from 'sprotty-elk/lib/inversify';
import { SGraph as SGraphP, SModelIndex, SNode as SNodeP, Point } from 'sprotty-protocol';
import { CustomMouseListener } from './mouse-interactions';
import { PopupModelProvider } from './popup';
import { ClassContextMenuItemProvider, ClassContextMenuService } from './context-menu';




// This file creates an inversify container for the sprotty diagram.
export default (containerId: string) => {
    const elkFactory: ElkFactory = () => new ElkConstructor({
        algorithms: ['layered']
    });

    const myModule = new ContainerModule((bind, unbind, isBound, rebind) => {
        bind(TYPES.ModelSource).to(ConceptGraphModelSource).inSingletonScope();
        rebind(TYPES.ILogger).to(ConsoleLogger).inSingletonScope();
        rebind(TYPES.LogLevel).toConstantValue(LogLevel.warn);
        bind(TYPES.IModelLayoutEngine).toService(ElkLayoutEngine);
        bind(ElkFactory).toConstantValue(elkFactory);
        rebind(ILayoutConfigurator).to(RandomGraphLayoutConfigurator);

        //popup
        bind(TYPES.IPopupModelProvider).to(PopupModelProvider);

        // context menu
        bind(TYPES.IContextMenuService).to(ClassContextMenuService);
        bind(TYPES.IContextMenuItemProvider).to(ClassContextMenuItemProvider);

        //double click
        bind(CustomMouseListener).toSelf().inSingletonScope();
        bind(TYPES.MouseListener).toService(CustomMouseListener);


        //drag and drop
        //bind(NodeCreator).toConstantValue(nodeCreator);
        // bind(DroppableMouseListener).toSelf().inSingletonScope();
        // bind(TYPES.MouseListener).toService(DroppableMouseListener);

        const context = { bind, unbind, isBound, rebind };
        configureModelElement(context, 'graph', SGraphImpl, SGraphView);
        configureModelElement(context, 'node:concept', RectangularNode, ConceptNodeView, {
            enable: [expandFeature]
        });
        configureModelElement(context, 'node:mini-concept', RectangularNode, MiniConceptView);
        configureModelElement(context, 'edge', SEdgeImpl, PolylineEdgeView);
        configureModelElement(context, 'label:heading', SLabelImpl, SLabelView)
        configureModelElement(context, 'label:text', SLabelImpl, SLabelView)
        //configureModelElement(context, 'comp:comp', SCompartment, SCompartmentView)

        //collapse expand button
        // configureModelElement(context, 'label:button:expand', SButton, CustomCollapseExpandView); //not used
        // configureButtonHandler({bind, isBound}, 'label:button:expand', CustomButtonHandler); //not used

        // if(0){
        // configureModelElement(context, 'routing-point', SRoutingHandle, SRoutingHandleView);
        // configureModelElement(context, 'volatile-routing-point', SRoutingHandle, SRoutingHandleView);
        // }


        configureViewerOptions(context, {
            needsClientLayout: true,
            baseDiv: containerId
        });
    });

    const container = new Container();
    loadDefaultModules(container);
    container.load(elkLayoutModule, myModule);
    return container;
};


// This class is used to configure the layouting done by elk.
// elk-sprotty does some layouting beforehand to calculate the sizes of
// labels and stuff, so not every elk configuration actually does something
export class RandomGraphLayoutConfigurator extends DefaultLayoutConfigurator {

    protected override graphOptions(sgraph: SGraphP, index: SModelIndex): LayoutOptions | undefined {
        return {
            'org.eclipse.elk.algorithm': 'org.eclipse.elk.layered',
            'org.eclipse.elk.spacing.nodeNode': '500', //doesn't work
        };
    }

    protected override nodeOptions(snode: SNodeP, index: SModelIndex): LayoutOptions | undefined {
        return {
            'org.eclipse.elk.nodeSize.constraints': 'PORTS PORT_LABELS NODE_LABELS MINIMUM_SIZE',
            //'org.eclipse.elk.nodeSize.minimum': '(40, 40)', // doesn't work
            'org.eclipse.elk.nodeLabels.placement': 'INSIDE H_CENTER V_TOP', // very important
            'org.eclipse.elk.spacing.labelLabel': '5',
            'org.eclipse.elk.layered.spacing.nodeNodeBetweenLayers': '50',
        };
    }

}
