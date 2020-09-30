'use strict';

import { IRepository } from '../../Api.Repository/Repositories/IRepository'
import { ITax } from '../../Api.Domain/Models/ITax';
import { Controller, Get, ClassMiddleware, Post, Patch, Delete, Middleware } from '@overnightjs/core';
import { localizer } from '../Middlewares/Localizer';
import { Request, Response } from 'express';
import { Request as RequestDto } from '../Models/Request';
import { ResponseDto } from '../Models/Response';
import { authorize } from '../Middlewares/Authorization';
import { validator } from '../Middlewares/Validator';
import { Roles } from '../../Api.Domain/Constants/Roles';
import { ErrorMiddleware } from '../Decorators/ErrorMiddleware';
import { patch } from '../Middlewares/Patch';
import { taxMiddleware } from '../Middlewares/Tax';

@ClassMiddleware(localizer.configureLanguages)
@ClassMiddleware(authorize.authenticateUser)
@ClassMiddleware(validator.validateRole(Roles.StationAdmin, Roles.SuperAdmin))
@Controller('api/v1/taxes')
class TaxController {

    private readonly _taxRepository: IRepository<ITax>;

    constructor (taxRepository: IRepository<ITax>) {
        this._taxRepository = taxRepository;
    }

    @Get()
    @Middleware(validator.validatePagination)
    @ErrorMiddleware
    public async getAllAsync (request: Request, response: Response): Promise<any> {
        const { query } = request;
        const dto = new RequestDto(query).setSort().setPagination().setCriteria().setRelation();
        const totalDocuments = await this._taxRepository.countAsync(dto.queryFilter);
        const users = await this._taxRepository.getAllAsync(dto.queryFilter);
        return ResponseDto.ok(true, users, response, query, totalDocuments);
    }

    @Get(':id')
    @Middleware(validator.isValidObjectId)
    @Middleware(taxMiddleware.existsById)
    @ErrorMiddleware
    public async getByIdAsync (request: Request, response: Response): Promise<any> {
        const { params: { id } } = request;
        const user = await this._taxRepository.getByIdAsync(id, {});
        return ResponseDto.ok(true, user, response);
    }

    @Post()
    @ErrorMiddleware
    public async createAsync (request: Request, response: Response): Promise<any> {
        const { body } = request;
        const result = await this._taxRepository.createAsync(body);
        return ResponseDto.created(true, result, response);
    }

    @Patch(':id')
    @Middleware(validator.isValidObjectId)
    @Middleware(taxMiddleware.existsById)
    @Middleware(patch.updateDate)
    @ErrorMiddleware
    public async updateByIdAsync (request: Request, response: Response): Promise<any> {
        const { params: { id }, body } = request;
        const result = await this._taxRepository.updateByIdAsync(id, body);
        return ResponseDto.created(true, result, response);
    }

    @Delete(':id')
    @Middleware(validator.isValidObjectId)
    @Middleware(taxMiddleware.existsById)
    @ErrorMiddleware
    public async deleteByIdAsync (request: Request, response: Response): Promise<any> {
        const { params:{ id } } = request;
        await this._taxRepository.deleteByIdAsync(id);
        return ResponseDto.noContent(true, response);
    }

}

export { TaxController };