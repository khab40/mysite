## Contact Form Backend (AWS Lambda + SES)

This is a template for the serverless contact form backend. Deploy this as an AWS Lambda function and integrate with API Gateway.

### Prerequisites
- AWS Account with appropriate permissions
- AWS CLI configured
- IAM role with SES and Lambda permissions

### Implementation Steps

1. **Create IAM Role**
   - Policy: AWSLambdaBasicExecutionRole + AmazonSESFullAccess

2. **Verify Email in SES**
   - AWS Console → SES → Verified Identities
   - Add your email address or domain

3. **Create Lambda Function**
   ```python
   import json
   import boto3
   import re
   from datetime import datetime

   ses = boto3.client('ses', region_name='us-east-1')

   def validate_email(email):
       pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
       return re.match(pattern, email) is not None

   def validate_input(body):
       if not body.get('name') or len(body['name']) < 2:
           return False, "Name must be at least 2 characters"
       if not body.get('email') or not validate_email(body['email']):
           return False, "Invalid email address"
       if not body.get('message') or len(body['message']) < 10:
           return False, "Message must be at least 10 characters"
       return True, "Valid"

   def lambda_handler(event, context):
       try:
           # Parse body
           body = json.loads(event.get('body', '{}'))
           
           # Validate input
           is_valid, message = validate_input(body)
           if not is_valid:
               return {
                   'statusCode': 400,
                   'headers': {'Content-Type': 'application/json'},
                   'body': json.dumps({'error': message})
               }
           
           # Sanitize input
           name = body['name'][:100]
           email = body['email'][:100]
           message_text = body['message'][:5000]
           
           # Send email
           response = ses.send_email(
               Source='noreply@yoursite.com',
               Destination={'ToAddresses': ['your-email@example.com']},
               Message={
                   'Subject': {
                       'Data': f'New Portfolio Message from {name}',
                       'Charset': 'UTF-8'
                   },
                   'Body': {
                       'Text': {
                           'Data': f'''
   New message received from your portfolio:

   Name: {name}
   Email: {email}
   Time: {datetime.now().isoformat()}

   Message:
   {message_text}

   ---
   Reply to: {email}
                           ''',
                           'Charset': 'UTF-8'
                       }
                   }
               }
           )
           
           # Also send confirmation to user
           ses.send_email(
               Source='noreply@yoursite.com',
               Destination={'ToAddresses': [email]},
               Message={
                   'Subject': {'Data': 'Message Received', 'Charset': 'UTF-8'},
                   'Body': {
                       'Text': {
                           'Data': f'''Thank you for reaching out!

   I've received your message and will get back to you soon.

   Best regards,
   Your Name
                           ''',
                           'Charset': 'UTF-8'
                       }
                   }
               }
           )
           
           return {
               'statusCode': 200,
               'headers': {
                   'Content-Type': 'application/json',
                   'Access-Control-Allow-Origin': '*'
               },
               'body': json.dumps({'success': True, 'message': 'Email sent successfully'})
           }
           
       except Exception as e:
           print(f'Error: {str(e)}')
           return {
               'statusCode': 500,
               'headers': {'Content-Type': 'application/json'},
               'body': json.dumps({'error': 'Failed to send email'})
           }
   ```

4. **Create API Gateway Endpoint**
   - Create REST API
   - POST method pointing to Lambda
   - Enable CORS
   - Deploy to stage

5. **Update index.html form**
   Update the form to point to your API Gateway URL:
   ```javascript
   const apiUrl = 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod/contact';
   
   contactForm.addEventListener('submit', async (e) => {
       e.preventDefault();
       
       const formData = new FormData(contactForm);
       const data = {
           name: formData.get('name'),
           email: formData.get('email'),
           message: formData.get('message')
       };
       
       try {
           const response = await fetch(apiUrl, {
               method: 'POST',
               body: JSON.stringify(data)
           });
           
           if (response.ok) {
               showNotification('Message sent! I\'ll get back to you soon.', 'success');
               contactForm.reset();
           } else {
               showNotification('Failed to send message. Please try again.', 'error');
           }
       } catch (error) {
           showNotification('Error sending message.', 'error');
       }
   });
   ```

### Deployment with CloudFormation (Optional)

Save as `template.yaml`:
```yaml
AWSTemplateFormatVersion: '2010-09-09'
Description: 'Portfolio Contact Form Backend'

Resources:
  ContactFormLambda:
    Type: AWS::Lambda::Function
    Properties:
      FunctionName: portfolio-contact-form
      Runtime: python3.11
      Handler: index.lambda_handler
      Code:
        ZipFile: |
          # Paste Lambda code here
      Role: !GetAtt LambdaRole.Arn

  LambdaRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: lambda.amazonaws.com
            Action: sts:AssumeRole
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
      Policies:
        - PolicyName: SESPolicy
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: ses:SendEmail
                Resource: '*'

  # API Gateway setup follows...
```

### Monitoring

Check Lambda logs:
```bash
aws logs tail /aws/lambda/portfolio-contact-form --follow
```

View SES statistics:
```bash
aws ses get-account-sending-enabled
```

### Cost Estimation
- Lambda: ~$0.20/million requests (free tier: 1M/month)
- SES: $0.10 per 1,000 emails sent (free tier: 62K/day)
- API Gateway: $3.50/million requests (free tier: 1M/month)

**Total**: Essentially free for personal portfolio

### Troubleshooting

**Email not sending:**
- Verify sender email in SES
- Check IAM permissions
- Review Lambda execution logs

**CORS errors:**
- Enable CORS in API Gateway
- Check allowed origins

**Lambda timeout:**
- Increase timeout value (default 3 sec, try 10 sec)
- Check network connectivity

