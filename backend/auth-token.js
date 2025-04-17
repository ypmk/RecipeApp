module.exports = {
    beforeRequest: (requestParams, context, ee, next) => {
        if (context.vars.authToken) {
            requestParams.headers = {
                ...requestParams.headers,
                Authorization: `Bearer ${context.vars.authToken}`,
            };
        }
        return next();
    }
};
