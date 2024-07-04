const autoBind = require('auto-bind');

class UsersHandler {
    constructor(service, validator) {
        this._service = service;
        this._validator = validator;

        autoBind(this);
    }

    async postUserHandler(request, h) {
        this._validator.validateUserPayload(request.payload);
        const { username, password, fullname } = request.payload;

        const userId = await this._service.addUser({ username, password, fullname });

        const response = h.response({
            status: 'success',
            data: {
                userId,
            },
        });
        response.code(201);
        return response;
    }

    async getUserByIdHandler(request, h) {
        const { id } = request.params;

        const users = await this._service.getUserById(id);

        return h.response({
            status: 'success',
            data: {
                users,
            },
        });
    }

    async getUserByUsernameHandler(request, h) {
        const { username = '' } = request.query;

        const users = await this._service.getUserByUsername(username);

        return h.response({
            status: 'success',
            data: {
                users,
            },
        });
    }
}

module.exports = UsersHandler;