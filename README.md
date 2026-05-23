# Alexey Khabalov Portfolio Website

A modern, professional portfolio website built with HTML5, CSS3, and JavaScript. Optimized for AWS S3 + CloudFront deployment with zero infrastructure costs.

## 📁 Folder Structure

```
mysite/
├── index.html                 # Main landing page
├── about.html                # Full projects page
├── css/
│   ├── styles.css            # Main styles
│   └── responsive.css        # Mobile responsive styles
├── js/
│   └── main.js               # Main JavaScript functionality
├── CNAME                     # Custom domain for GitHub Pages
├── images/                   # Your images (portfolio photos, project screenshots)
├── docs/                     # Documents (CV, certificates, etc.)
│   └── CV.pdf               # Your CV (add your file here)
├── projects/                # Individual project pages
│   ├── project1.html
│   ├── project2.html
│   └── project3.html
├── assets/                  # Additional assets (icons, fonts, etc.)
└── README.md               # This file

## 🎨 Features

- **Responsive Design**: Mobile-first approach, works on all devices
- **Fast Performance**: Optimized for web with minimal dependencies
- **Accessibility**: WCAG compliant, semantic HTML
- **Modern UI**: Clean, professional design with smooth animations
- **SEO Optimized**: Proper meta tags and structured data
- **Contact Form**: Ready to integrate with AWS Lambda/API Gateway
- **System/Time Theme**: Uses the visitor's system light/dark setting, with local-time fallback
- **Print Friendly**: Professional print styles included

## 🚀 Getting Started Locally

1. **Clone or download the repository**
   ```bash
   git clone git@github.com:khab40/mysite.git
   cd mysite
   ```

2. **Open locally**
   - Simply open `index.html` in your browser
   - Or use a local server: `python -m http.server 8000`

3. **Customize content**
   - Edit `index.html` to add your information
   - Update CSS colors in `css/styles.css`
   - Replace placeholder images with your own

## 🔧 Customization Guide

### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
    --primary-color: #0066ff;
    --secondary-color: #6c5ce7;
    /* ... more colors ... */
}
```

### Content Sections
- **Hero Section**: Edit name, title, and description in index.html
- **About Section**: Update stats and highlights
- **Projects**: Add project cards with details
- **Skills**: Customize your skills and expertise
- **Contact**: Update email, phone, social links

### Images
- Replace placeholder images in `/images` folder
- Update image paths in HTML files
- Keep images optimized (use tools like TinyPNG)

## 📦 File Guidelines

### Documents (`/docs`)
- Add your CV as `CV.pdf`
- Include certificates, licenses, or other relevant documents
- Use descriptive filenames

### Images (`/images`)
- Use WebP format for better compression
- Provide JPG fallbacks for older browsers
- Name files descriptively: `project-1-screenshot.jpg`

### Projects (`/projects`)
Create individual HTML pages for each project:
```html
<!-- projects/project1.html -->
<a href="project1.html" class="project-link">View Project →</a>
```

## 🌐 AWS Deployment Guide

### Option 1: AWS S3 + CloudFront (Recommended - ~$0/month)

#### Step 1: Create S3 Bucket
```bash
# Using AWS CLI
aws s3 mb s3://khabalov.dev --region us-east-1
```

#### Step 2: Enable Static Website Hosting
1. Go to S3 bucket → Properties
2. Enable "Static website hosting"
3. Set Index document: `index.html`
4. Set Error document: `index.html`

#### Step 3: Upload Files
```bash
aws s3 sync . s3://khabalov.dev --exclude ".git*" --exclude "*.md"
```

#### Step 4: Set Bucket Policy
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::khabalov.dev/*"
        }
    ]
}
```

#### Step 5: Create CloudFront Distribution
1. Go to CloudFront → Create Distribution
2. Origin Domain: Select your S3 bucket
3. Origin Access: Choose "Origin access control (recommended)"
4. Viewer Protocol: Redirect HTTP to HTTPS
5. Cache settings:
   - TTL: 86400 seconds (1 day)
   - Compress objects: Yes
6. Custom error response:
   - 404 → /index.html
   - 403 → /index.html
7. Create distribution

#### Step 6: Set Up Custom Domain (Route53)
```bash
# Using AWS CLI
aws route53 change-resource-record-sets --hosted-zone-id ZONE_ID \
  --change-batch file://change-batch.json
```

**change-batch.json:**
```json
{
    "Changes": [
        {
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "khabalov.dev",
                "Type": "A",
                "AliasTarget": {
                    "HostedZoneId": "Z2FDTNDATAQYW2",
                    "DNSName": "your-distribution.cloudfront.net",
                    "EvaluateTargetHealth": false
                }
            }
        }
    ]
}
```

#### Step 7: SSL/TLS Certificate
1. Go to ACM (AWS Certificate Manager)
2. Request certificate for `khabalov.dev` and `www.khabalov.dev`
3. Validate DNS
4. Attach to CloudFront distribution

### Option 2: GitHub Pages (Free Alternative)
1. Push code to GitHub
2. Go to Repository Settings → Pages
3. Select main branch, /root directory
4. GitHub will provide URL
5. Configure custom domain in DNS

### Option 3: Netlify (Faster Setup, Free Tier Available)
1. Push to GitHub
2. Connect Netlify to GitHub repo
3. Set build command: (leave empty)
4. Set publish directory: `/` (root)
5. Deploy automatically on push

## 💰 Cost Breakdown (AWS)

- **S3 Storage**: ~$0.023/GB/month (first 5GB free)
- **CloudFront**: ~$0.085/GB (first 1GB free)
- **Route53**: $0.50/month per hosted zone
- **ACM SSL**: Free
- **Total**: ~$0.50-$2/month (typically free tier)

## 🔒 Security Best Practices

✓ Use HTTPS only (CloudFront handles this)
✓ Enable S3 versioning for rollback capability
✓ Set up IAM users with limited permissions
✓ Enable CloudTrail for audit logs
✓ Implement contact form validation
✓ Use environment variables for sensitive data

## 📊 Analytics Setup

### Google Analytics
Add to `<head>` section:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_ID');
</script>
```

### CloudFront Analytics
- Automatically available in CloudFront console
- Monitor visitors, bandwidth, cache hit ratio

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to AWS S3 + CloudFront

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      - name: Sync to S3
        run: |
          aws s3 sync . s3://khabalov.dev \
            --exclude ".git*" --exclude "*.md"
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id YOUR_DIST_ID \
            --paths "/*"
```

## 📱 Mobile Optimization

- ✓ Responsive grid layout
- ✓ Touch-friendly buttons (min 44px)
- ✓ Optimized images
- ✓ Fast load times
- ✓ Readable font sizes

## 🧪 Testing

### Performance
- Use Google PageSpeed Insights
- Target: 90+ score
- Optimize images, minimize CSS/JS

### Accessibility
- Use WAVE or Lighthouse
- Test keyboard navigation
- Check color contrast ratios

### Cross-browser
- Test on Chrome, Firefox, Safari, Edge
- Verify mobile responsiveness

## 📞 Contact Form Integration

To enable the contact form, create a Lambda function:

```python
import json
import boto3

ses_client = boto3.client('ses', region_name='us-east-1')

def lambda_handler(event, context):
    body = json.loads(event['body'])
    
    response = ses_client.send_email(
        Source='noreply@khabalov.dev',
        Destination={'ToAddresses': ['alexey.khabalov@gmail.com']},
        Message={
            'Subject': {'Data': f"New Message from {body['name']}"},
            'Body': {'Text': {'Data': body['message']}}
        }
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps('Email sent successfully')
    }
```

Then update the contact form to point to your API Gateway endpoint.

## 🚀 Deployment Checklist

- [ ] Customize all content (name, bio, projects)
- [ ] Add your photos and project screenshots
- [ ] Update social media links
- [ ] Test on mobile devices
- [ ] Run PageSpeed Insights
- [ ] Create AWS account and bucket
- [ ] Set up CloudFront distribution
- [ ] Configure custom domain
- [ ] Enable HTTPS
- [ ] Set up contact form backend
- [ ] Test all forms and links
- [ ] Set up analytics
- [ ] Enable monitoring/alerts
- [ ] Create CI/CD pipeline
- [ ] Document changes

## 📚 Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [HTML5 Spec](https://html.spec.whatwg.org/)
- [CSS3 Guide](https://www.w3.org/Style/CSS/)
- [MDN Web Docs](https://developer.mozilla.org/)

## 📝 License

This portfolio template is free to use and modify. 

## 🤝 Support

For issues or questions:
1. Check the AWS documentation
2. Review browser console for errors
3. Test on different devices
4. Enable CloudFront logging for issues

---

**Last Updated**: 2026
**Version**: 1.0.0
