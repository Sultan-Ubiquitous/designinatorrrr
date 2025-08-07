import onFinished from 'on-finished';
import onHeaders from 'on-headers';
import { IncomingMessage, ServerResponse } from 'http';

declare module 'http' {
    interface ServerResponse {
        _startTime?: [number, number];
    }
}

interface Colors {
    red: string;
    green: string;
    yellow: string;
    cyan: string;
    reset: string;
}

function simpleLogger() {
    return function(req: IncomingMessage, res: ServerResponse, next: () => void) {
        const startTime = process.hrtime();
        
        onHeaders(res, () => {
            res._startTime = process.hrtime();
        });

        onFinished(res, () => {
            const elapsed = getResponseTime(startTime);
            const status = res.statusCode;
            const method = req.method;
            
            const colors: Colors = {
                red: '\x1b[31m',
                green: '\x1b[32m',
                yellow: '\x1b[33m',
                cyan: '\x1b[36m',
                reset: '\x1b[0m'
            };
            
            let color = colors.green; // Default to green (2xx)
            if (status && status >= 500) color = colors.red; // Server errors
            else if (status && status >= 400) color = colors.yellow; // Client errors
            else if (status && status >= 300) color = colors.cyan; // Redirects
            
            console.log(
                `${method} ${req.url} ${color}${status}${colors.reset} ${elapsed}ms`
            );
        });

        next();
    };
}

function getResponseTime(startTime: [number, number]): string {
    const diff = process.hrtime(startTime);
    return (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
}

export default simpleLogger;