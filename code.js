document.addEventListener("DOMContentLoaded", function () {
    const multipleChoiceRadio = document.getElementById("multipleChoice");
    const singleChoiceRadio = document.getElementById("singleChoice");

    multipleChoiceRadio.addEventListener("change", function () {
        document.getElementById("correctAnswerAmountDiv").style.display = "unset";
    });

    singleChoiceRadio.addEventListener("change", function () {
        document.getElementById("correctAnswerAmountDiv").style.display = "none";
    });

    document.getElementById("createUser").addEventListener("click", function () {
        sendAjaxRequest("createUser");
    });

    document.getElementById("createQuestion").addEventListener("click", function () {
        sendAjaxRequest("createQuestions");
    });

    document.getElementById("createAnswerRun").addEventListener("click", function () {
        sendAjaxRequest("createAnswerRun");
    });

    document.getElementById("flushTables").addEventListener("click", function () {
        sendAjaxRequest("flushTables");
    });

    document.getElementById("readCsv").addEventListener("click", function () {
        sendAjaxRequest("readCsv");
    });

    function sendAjaxRequest(action) {
        var xhr = new XMLHttpRequest();
        xhr.open("POST", "/bachelorthesis/dataCreator/dataCreator.php", true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                addText(xhr.responseText);
            }
        };
        switch (action) {
            case "createUser":
                var userAmount = document.getElementById("userAmount").value;
                xhr.send("action=" + action
                    + "&amount=" + userAmount);
                break;
            case "createQuestions":
                var questionAmount = Number(document.getElementById("questionAmount").value);
                const questionType = document.getElementById("multipleChoice").checked ? "multipleChoice" : "singleChoice";
                var answerAmount = Number(document.getElementById("answerAmount").value);
                var correctAnswerAmount = Number(document.getElementById("correctAnswerAmount").value);

                switch (questionType) {
                    case "multipleChoice":
                        if (correctAnswerAmount >= answerAmount) {
                            document.getElementById("errorQuestion").style.setProperty("display", "unset", "important");
                        } else {
                            document.getElementById("errorQuestion").style.setProperty("display", "none", "important");
                            xhr.send("action=" + action
                                + "&questionAmount=" + questionAmount
                                + "&questionType=" + questionType
                                + "&answerAmount=" + answerAmount
                                + "&correctAnswerAmount=" + correctAnswerAmount);
                        }
                        break;
                    case "singleChoice":
                        xhr.send("action=" + action
                            + "&questionAmount=" + questionAmount
                            + "&questionType=" + questionType
                            + "&answerAmount=" + answerAmount);
                        break;
                    default:
                        break;
                }
                break;
            case "createAnswerRun":
                var runAnswerAmount = document.getElementById("runAnswerAmount").value;
                var questionAnswerAmount = document.getElementById("questionAnswerAmount").value;
                var peopleAnswerAmount = document.getElementById("peopleAnswerAmount").value;
                xhr.send("action=" + action
                    + "&runs=" + runAnswerAmount
                    + "&questionAmount=" + questionAnswerAmount
                    + "&peopleAmount=" + peopleAnswerAmount);
                break;
            case "flushTables":
                xhr.send("action=" + action);
                break;
            case "readCsv":
                const csvType = document.getElementById("multipleChoiceCsv").checked ? "multipleChoice" : "singleChoice";
                xhr.send("action=" + action
                    + "&csvType=" + csvType);
                break;
            default:
                break;
        }


    }

    function addText(input) {
        const currentDiv = document.getElementById("serveroutput");
        if (currentDiv.innerHTML == "No output yet") {
            currentDiv.innerHTML = input + "&#10;";
        } else {
            currentDiv.innerHTML = input + "&#10;" + currentDiv.innerHTML;
        }
    }

});
