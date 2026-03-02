import { container } from "tsyringe";
import { AuthGuard } from "../guards/auth.guard";
import  {Request} from "express";

export async function auth(req, res, next) {
  const guard = container.resolve(AuthGuard);

  const user = await guard.validate(req);

  req.user = user;

  next();
}