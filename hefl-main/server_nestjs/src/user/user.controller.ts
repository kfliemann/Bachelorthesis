import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private userService: UserService) { }

    /**
     * 
     * @param user_id 
     * @param user_cookie 
     * @returns boolean (true if logged in user, false if not correct logged in user)
     */
    validateUser(user_id: number, user_cookie: string) {
        return this.userService.validateUser(user_id, user_cookie);
    }

    /**
     * 
     * @param user_id 
     * @param user_cookie 
     * @returns boolean (true if admin, false if no admin)
     */
    validateAdmin(user_id: number, user_cookie: string) {
        return this.userService.validateAdmin(user_id, user_cookie);
    }
}
