const rateLimit = require('express-rate-limit')
const {logEvent} = require("./logger")

const loginLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minutes
	max: 5, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    message: {message: "Too many login attempts from this IP, please try again after a 60 second pause"},
    handler: (request, response, next, options) =>{
        logEvent(`To many Requests: ${request.method}\t ${request.url}\t ${request.headers.origin}`,'errLog.log'),
		response.status(options.statusCode).send(options.message.message)
    },
	standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers
	// store: ... , // Use an external store for more precise rate limiting
})

module.exports = loginLimiter