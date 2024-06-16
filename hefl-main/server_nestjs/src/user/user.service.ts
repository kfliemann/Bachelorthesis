
import { PrismaService } from '@/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
    constructor(private prisma: PrismaService) { }

    /**
     * validate user
     * @param user_id 
     * @param user_cookie 
     * @returns boolean (true if logged in user, false if not correct logged in user)
     */
    async validateUser(user_id: number, user_cookie: string) {
        const isUser = await this.prisma.user.count({
            where: {
                id: user_id,
                session_cookie: user_cookie,
            },
        });

        return isUser;
    }

    /**
     * validate admin
     * @param user_id 
     * @param user_cookie 
     * @returns boolean (true if admin, false if no admin)
     */
    async validateAdmin(user_id: number, user_cookie: string) {
        const isAdmin = await this.prisma.user.count({
            where: {
                id: user_id,
                session_cookie: user_cookie,
                globalRole: "ADMIN"
            },
        });

        return isAdmin;
    }

}
