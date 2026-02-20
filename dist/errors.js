class MawaqitError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.name = "MawaqitError";
        this.statusCode = statusCode;
    }
}

class MawaqitNotFoundError extends MawaqitError {
    constructor(masjidId) {
        super(`Mosque "${masjidId}" not found`, 404);
        this.name = "MawaqitNotFoundError";
    }
}

class MawaqitParseError extends MawaqitError {
    constructor(masjidId) {
        super(`Failed to parse prayer data for "${masjidId}"`, 500);
        this.name = "MawaqitParseError";
    }
}

class MawaqitFetchError extends MawaqitError {
    constructor(url) {
        super(`Something went wrong fetching "${url}"`, 502);
        this.name = "MawaqitFetchError";
    }
}

class MawaqitValidationError extends MawaqitError {
    constructor(message) {
        super(message, 400);
        this.name = "MawaqitValidationError";
    }
}

module.exports = {
    MawaqitError,
    MawaqitNotFoundError,
    MawaqitParseError,
    MawaqitFetchError,
    MawaqitValidationError,
};