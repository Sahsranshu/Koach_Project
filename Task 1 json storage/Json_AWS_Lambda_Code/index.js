const { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } = require("@aws-sdk/client-s3");
const { randomUUID } = require("crypto");

const BUCKET_NAME = process.env.BUCKET_NAME || 'koachtask1';
const s3Client = new S3Client();

exports.handler = async (event) => {
    try {
        const httpMethod = event.httpMethod || event.requestContext.http.method;
        if (httpMethod === 'POST') {
            return handlePostRequest(event);
        } else if (httpMethod === 'GET') {
            return handleGetRequest();
        } else {
            return {
                statusCode: 405,
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
};

async function handlePostRequest(event) {
    try {
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON input', details: error.message })
            };
        }

        if (!body || typeof body !== 'object') {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request body', details: 'Body must be a JSON object' })
            };
        }

        const nameValidation = validateName(body.name);
        const ageValidation = validateAge(body.age);

        if (!nameValidation.isValid || !ageValidation.isValid) {
            return {
                statusCode: 400,
                body: JSON.stringify({ 
                    error: 'Validation failed',
                    details: {
                        name: nameValidation.isValid ? null : nameValidation.error,
                        age: ageValidation.isValid ? null : ageValidation.error
                    }
                })
            };
        }

        const filename = `${randomUUID()}.json`;
        const params = {
            Bucket: BUCKET_NAME,
            Key: filename,
            Body: JSON.stringify(body),
            ContentType: 'application/json'
        };
        
        try {
            const command = new PutObjectCommand(params);
            const result = await s3Client.send(command);
            
            const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
            
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Data successfully stored',
                    e_tag: result.ETag,
                    url: s3Url
                })
            };
        } catch (s3Error) {
            console.error('S3 error in POST:', s3Error);
            if (s3Error.name === 'AccessDenied') {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: 'Access Denied to S3 Bucket', details: s3Error.message })
                };
            }
            if (s3Error.name === 'NoSuchBucket') {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'S3 Bucket Not Found', details: s3Error.message })
                };
            }
            throw s3Error; // Re-throw for general error handling
        }
    } catch (error) {
        console.error('Error in POST:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
}

async function handleGetRequest() {
    try {
        const listParams = {
            Bucket: BUCKET_NAME
        };
        
        let listedObjects;
        try {
            const listCommand = new ListObjectsV2Command(listParams);
            listedObjects = await s3Client.send(listCommand);
        } catch (listError) {
            console.error('Error listing S3 objects:', listError);
            if (listError.name === 'AccessDenied') {
                return {
                    statusCode: 403,
                    body: JSON.stringify({ error: 'Access Denied to S3 Bucket', details: listError.message })
                };
            }
            if (listError.name === 'NoSuchBucket') {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ error: 'S3 Bucket Not Found', details: listError.message })
                };
            }
            throw listError; // Re-throw for general error handling
        }
        
        const allData = [];
        
        for (const obj of listedObjects.Contents || []) {
            const getParams = {
                Bucket: BUCKET_NAME,
                Key: obj.Key
            };
            
            try {
                const getCommand = new GetObjectCommand(getParams);
                const { Body } = await s3Client.send(getCommand);
                const bodyContents = await streamToString(Body);
                const fileData = JSON.parse(bodyContents);
                allData.push(fileData);
            } catch (getError) {
                console.error(`Error getting object ${obj.Key}:`, getError);
                // Skip this object and continue with others
                continue;
            }
        }
        
        return {
            statusCode: 200,
            body: JSON.stringify(allData)
        };
    } catch (error) {
        console.error('Error in GET:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error', details: error.message })
        };
    }
}

const streamToString = (stream) =>
    new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    });

function validateName(name) {
    if (typeof name !== 'string' || name.trim() === '') {
        return { isValid: false, error: 'Name is required' };
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
        return { isValid: false, error: 'Name must be at least 2 characters long' };
    }
    if (trimmedName.length > 50) {
        return { isValid: false, error: 'Name must not exceed 50 characters' };
    }

    const nameRegex = /^[A-Za-z]+(?:[-\s][A-Za-z]+)*$/;
    if (!nameRegex.test(trimmedName)) {
        return { isValid: false, error: 'Name can only contain alphabetic characters, spaces, and hyphens' };
    }

    return { isValid: true };
}

function validateAge(age) {
    if (age === undefined || age === null) {
        return { isValid: false, error: 'Age is required' };
    }
    if (typeof age !== 'number' || !Number.isInteger(age)) {
        return { isValid: false, error: 'Age must be a whole number' };
    }
    if (age < 1) {
        return { isValid: false, error: 'Age must be at least 1' };
    }
    if (age > 120) {
        return { isValid: false, error: 'Age must not exceed 120' };
    }

    return { isValid: true };
}