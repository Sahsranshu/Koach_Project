
# Project Name: AWS Lambda JSON Storage with AngularJS Frontend

## Table of Contents
- Backend
  - Technology Stack
  - Setup and Running
  - Code Breakdown
  - API Endpoints
  - IAM Policies
- Frontend
  - Technology Stack
  - File Structure
  - Setup and Running
  - Code Breakdown
  - Usage

---

## Backend

### Technology Stack:
1. **AWS Lambda (Node.js)**: The serverless compute service used to execute the backend logic.
2. **S3**: For storing JSON data securely and efficiently.
3. **AWS SDK**: Used to interact with S3 for data storage and retrieval.
4. **API Gateway**: To route HTTP requests (POST and GET) to the Lambda function.

### Setup and Running:

1. **Set up an S3 bucket**:
   - Go to the AWS S3 console.
   - Create a new bucket (ensure it's properly secured with the right permissions).

2. **Configure API Gateway**:
   - Create a new API.
   - Define the POST and GET methods and link them to the Lambda function.
   - Ensure the API Gateway has appropriate CORS policies enabled for cross-origin requests.

3. **Deploy the Lambda function**:
   - **Add the Lambda code**: Go to AWS Lambda, create a new function, and select Node.js as the runtime.
   - **Upload the Lambda code**: You can upload a `.zip` file of your function or write the code in the AWS console.
   - **Set API Gateway as the trigger**: Link the Lambda function to the API Gateway you created.
   - **Configure environment variables**: Add any required environment variables for the S3 bucket or API keys if needed.

4. **Create IAM policies for Lambda**:
   - **Navigate to IAM roles in AWS**.
   - Create a role with the necessary policies that allow Lambda to interact with S3.
   - The required actions in the policy are `s3:PutObject`, `s3:GetObject`, and `s3:ListBucket`.
   - **Attach this role to your Lambda function**.

5. **Generate API through API Gateway**:
   - Go to **API Gateway** and create a new REST API.
   - Add a new resource and create methods (POST and GET).
   - Link these methods to the Lambda function.
   - Deploy the API to create an endpoint, and ensure to test the API once deployed.

### Code Breakdown:
1. **POST Endpoint**: Handles incoming JSON data.
   - Stores the JSON in the specified S3 bucket.
   - Returns a response containing the `e_tag` and the URL of the stored file.
   
2. **GET Endpoint**: Retrieves all JSON files from the S3 bucket.
   - Compiles the contents of all files into a single response and returns it.

### API Endpoints:
1. **POST API**:  
   - **URL**: `https://your-api-endpoint/dev/JsonStorageFunction`
   - This endpoint accepts JSON data and stores it in the S3 bucket.

2. **GET API**:  
   - **URL**: `https://your-api-endpoint/dev/JsonStorageFunction`
   - This endpoint retrieves all stored JSON files from S3 and returns the compiled data.

### IAM Policies:
- IAM policies and roles are created in AWS to allow the Lambda function to access S3. You can follow this process:
  - Go to **IAM** in the AWS console.
  - Create a new role and attach the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```
  - Attach this role to the Lambda function.

---

## Frontend

### Technology Stack:
1. **AngularJS**: A JavaScript framework used for building the user interface and interacting with the API.

### File Structure:

```
/src
  ├── app/
  │   ├── data-form.component.ts     // Handles data form input from the user
  │   ├── data-list.component.ts     // Displays the list of JSON data retrieved from the backend
  ├── assets/                        // Static assets (if any)
  ├── main.ts                        // The main entry point for the Angular app
  └── index.html                     // Main HTML file for the frontend
```

### Setup and Running:
1. **Install Node.js and Angular CLI**:
   - Download and install Node.js from [https://nodejs.org/](https://nodejs.org/).
   - Install Angular CLI using the command:  
     ```bash
     npm install -g @angular/cli
     ```

2. **Clone the repository**:
   - Clone the frontend project repository and navigate into the directory.

3. **Install dependencies**:
   - Run the following command to install all necessary dependencies:
     ```bash
     npm install
     ```

4. **Run the frontend application**:
   - Use the Angular CLI to serve the frontend locally:
     ```bash
     ng serve
     ```
   - The application will be available at `http://localhost:4200/`.

### Code Breakdown:
1. **DataFormComponent**:
   - This component handles user input (JSON data) and sends a POST request to the backend using Angular’s `HttpClient`.
   
   Example code snippet for form submission:
   ```typescript
   onSubmit() {
     this.apiService.postData({ name: this.name, age: this.age }).subscribe(
       (response) => {
         this.message = 'Data submitted successfully!';
       },
       (error) => {
         this.showError('Error submitting data.');
       }
     );
   }
   ```
   Validation check is added to ensure the `name` is not empty and the `age` is between **1 and 120**.

2. **DataListComponent**:
   - This component fetches and displays the list of JSON files stored in the backend by sending a GET request.

### Usage:
- **Submit Data**: 
   - Use the form on the frontend to input JSON data and submit it to the backend using the POST API.
- **Retrieve Data**: 
   - The data list component will display all stored JSON data by fetching it from the backend using the GET API.
