import { Response } from 'express';
import { HttpStatus } from './http-status';

export function error(res: Response, message: string, data: any = {}, status = HttpStatus.INTERNAL_SERVER_ERROR) {
    res.status(status);
    return res.json({ status: false, message, data });
}

export function success(res: Response, message: string, data: any = {}, status = HttpStatus.OK) {
    res.status(status);
    return res.json({ status: true, message, data });
}