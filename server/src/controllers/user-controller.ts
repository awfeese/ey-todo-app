import { Request, Response } from 'express';
import userService from '../services/user-service';
import { serverError, success, unauthorized } from '../utils/response';

const userController = {
    login: (req: Request, res: Response) => {
        try {
            const token = userService.login(req.body);
            return token ? success(res, { token }) : unauthorized(res, 'Invalid username or password.');
        } catch (err) {
            return serverError(res, err);
        }
    }
};

export default userController;
