#!/usr/bin/env python3
"""
Test script to validate Azure OCR endpoint URL construction
Run this before deploying to catch URL formatting issues
"""

def test_endpoint_cleaning():
    """Test the endpoint URL cleaning logic"""
    
    API_VERSION = "2024-07-31"
    MODEL = "prebuilt-layout"
    
    test_cases = [
        # (input_endpoint, expected_cleaned, description)
        (
            "https://myresource.cognitiveservices.azure.com",
            "https://myresource.cognitiveservices.azure.com",
            "Clean endpoint - no changes needed"
        ),
        (
            "https://myresource.cognitiveservices.azure.com/",
            "https://myresource.cognitiveservices.azure.com",
            "Endpoint with trailing slash"
        ),
        (
            "https://myresource.cognitiveservices.azure.com//",
            "https://myresource.cognitiveservices.azure.com",
            "Endpoint with multiple trailing slashes"
        ),
        (
            "https://myresource.cognitiveservices.azure.com/formrecognizer",
            "https://myresource.cognitiveservices.azure.com",
            "Endpoint with /formrecognizer path"
        ),
        (
            "https://myresource.cognitiveservices.azure.com/formrecognizer/",
            "https://myresource.cognitiveservices.azure.com",
            "Endpoint with /formrecognizer/ path"
        ),
        (
            "https://myresource.cognitiveservices.azure.com/formrecognizer/v1.0",
            "https://myresource.cognitiveservices.azure.com",
            "Endpoint with /formrecognizer and version"
        ),
    ]
    
    print("=" * 80)
    print("Testing Azure Endpoint URL Cleaning")
    print("=" * 80)
    print()
    
    all_passed = True
    
    for input_endpoint, expected_cleaned, description in test_cases:
        # Apply the cleaning logic (same as in ocr.py)
        endpoint = input_endpoint.rstrip("/")
        if "/formrecognizer" in endpoint:
            endpoint = endpoint.split("/formrecognizer")[0]
        
        # Build the full URL
        full_url = f"{endpoint}/formrecognizer/documentModels/{MODEL}:analyze?api-version={API_VERSION}"
        
        # Check if cleaning worked
        passed = endpoint == expected_cleaned
        all_passed = all_passed and passed
        
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {description}")
        print(f"  Input:    {input_endpoint}")
        print(f"  Cleaned:  {endpoint}")
        print(f"  Expected: {expected_cleaned}")
        print(f"  Full URL: {full_url}")
        
        # Check for common issues in the full URL
        issues = []
        if "//" in full_url.replace("https://", ""):
            issues.append("⚠️  Double slashes detected")
        if full_url.count("/formrecognizer") > 1:
            issues.append("⚠️  Duplicate /formrecognizer path")
        if full_url.endswith("/"):
            issues.append("⚠️  URL ends with slash")
        
        if issues:
            print(f"  Issues: {', '.join(issues)}")
        
        print()
    
    print("=" * 80)
    if all_passed:
        print("✅ All tests PASSED! URL cleaning logic is working correctly.")
    else:
        print("❌ Some tests FAILED! Review the cleaning logic before deploying.")
    print("=" * 80)
    print()
    
    return all_passed


def test_expected_url_format():
    """Show what the expected URL format should be"""
    
    print("=" * 80)
    print("Expected Azure Document Intelligence URL Format")
    print("=" * 80)
    print()
    
    example_endpoint = "https://myresource.cognitiveservices.azure.com"
    model = "prebuilt-layout"
    api_version = "2024-07-31"
    
    expected_url = f"{example_endpoint}/formrecognizer/documentModels/{model}:analyze?api-version={api_version}"
    
    print("✅ Correct URL format:")
    print(f"   {expected_url}")
    print()
    
    print("❌ Common mistakes:")
    print(f"   {example_endpoint}//formrecognizer/documentModels/{model}:analyze?api-version={api_version}")
    print("   (double slash before formrecognizer)")
    print()
    print(f"   {example_endpoint}/formrecognizer/formrecognizer/documentModels/{model}:analyze?api-version={api_version}")
    print("   (duplicate formrecognizer path)")
    print()
    print(f"   {example_endpoint}/documentModels/{model}:analyze?api-version={api_version}")
    print("   (missing formrecognizer path)")
    print()
    
    print("=" * 80)
    print()


def test_api_versions():
    """Show supported API versions"""
    
    print("=" * 80)
    print("Azure Document Intelligence API Versions")
    print("=" * 80)
    print()
    
    versions = [
        ("2024-07-31", "Latest stable", "✅ Recommended"),
        ("2024-02-29-preview", "Preview", "⚠️  May have changes"),
        ("2023-07-31", "Older stable", "✅ Good fallback"),
        ("2022-08-31", "Legacy", "⚠️  Old, may be deprecated"),
    ]
    
    print("Available API versions:")
    for version, description, status in versions:
        print(f"  {status} {version:25} - {description}")
    
    print()
    print("Current configured version: 2024-07-31")
    print()
    print("If you get 404 errors, try:")
    print("  1. Verify your Azure resource supports 2024-07-31")
    print("  2. Try 2023-07-31 as a fallback")
    print("  3. Check Azure Portal for your resource's supported versions")
    print()
    print("=" * 80)
    print()


def test_model_names():
    """Show supported model names"""
    
    print("=" * 80)
    print("Azure Document Intelligence Models")
    print("=" * 80)
    print()
    
    models = [
        ("prebuilt-layout", "Best for wine lists", "✅ Recommended", "Extracts text with layout info"),
        ("prebuilt-read", "Simple text extraction", "✅ Alternative", "Basic OCR, faster but less context"),
        ("prebuilt-document", "General documents", "✅ Alternative", "Good for structured documents"),
    ]
    
    print("Available models:")
    for model, use_case, status, description in models:
        print(f"  {status} {model:25} - {use_case}")
        print(f"     {description}")
    
    print()
    print("Current configured model: prebuilt-layout")
    print()
    print("=" * 80)
    print()


if __name__ == "__main__":
    print("\n")
    print("🧪 Testing Azure OCR Endpoint Configuration")
    print("=" * 80)
    print()
    
    # Run all tests
    passed = test_endpoint_cleaning()
    test_expected_url_format()
    test_api_versions()
    test_model_names()
    
    # Final summary
    print("=" * 80)
    print("Test Summary")
    print("=" * 80)
    print()
    
    if passed:
        print("✅ URL cleaning logic: PASSED")
        print("✅ Ready to deploy!")
        print()
        print("Next steps:")
        print("  1. Commit and push changes")
        print("  2. Wait for Render to deploy (2-3 minutes)")
        print("  3. Test health endpoint: curl https://pocket-pallet.onrender.com/api/v1/ocr/health")
        print("  4. Test Azure connection: curl https://pocket-pallet.onrender.com/api/v1/ocr/test-azure-connection")
        print()
        exit(0)
    else:
        print("❌ URL cleaning logic: FAILED")
        print("❌ Fix issues before deploying")
        print()
        exit(1)

