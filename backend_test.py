import requests
import sys
import json
from datetime import datetime

class MistralStoryMakerTester:
    def __init__(self, base_url="https://3bbe5f3c-b7ed-4312-8a3e-38efb8b66b83.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.created_story_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    elif isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    else:
                        print(f"   Response: Large response received")
                except:
                    print(f"   Response: Non-JSON response")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_basic_api_health(self):
        """Test basic API health"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_generate_story(self):
        """Test story generation with Mistral AI"""
        test_prompt = "A young wizard discovers a hidden library filled with magical books"
        success, response = self.run_test(
            "Generate Story with Mistral AI",
            "POST",
            "generate-story",
            200,
            data={
                "prompt": test_prompt,
                "max_tokens": 500,
                "temperature": 0.7
            }
        )
        
        if success and response.get('success') and response.get('story'):
            print(f"   ✨ Story generated successfully! Length: {len(response['story'])} characters")
            return True, response['story']
        return False, ""

    def test_complete_story(self, existing_story):
        """Test story completion functionality"""
        if not existing_story:
            print("❌ No existing story to complete")
            return False
            
        success, response = self.run_test(
            "Complete Story with Mistral AI",
            "POST",
            "complete-story",
            200,
            data={
                "prompt": existing_story[:200],  # Use first 200 chars as prompt
                "max_tokens": 300,
                "temperature": 0.7
            }
        )
        
        if success and response.get('success') and response.get('completion'):
            print(f"   ✨ Story completion successful! Length: {len(response['completion'])} characters")
            return True
        return False

    def test_chat_functionality(self):
        """Test chat with Mistral AI"""
        test_messages = [
            {"role": "user", "content": "Help me create a character for a fantasy story"}
        ]
        
        success, response = self.run_test(
            "Chat with Mistral AI",
            "POST",
            "chat",
            200,
            data={
                "messages": test_messages,
                "max_tokens": 500,
                "temperature": 0.7
            }
        )
        
        if success and response.get('success') and response.get('response'):
            print(f"   💬 Chat response received! Length: {len(response['response'])} characters")
            return True
        return False

    def test_save_story(self, story_content, prompt):
        """Test saving a story to database"""
        test_title = f"Test Story - {datetime.now().strftime('%H:%M:%S')}"
        
        success, response = self.run_test(
            "Save Story to Database",
            "POST",
            "stories",
            200,
            data={
                "title": test_title,
                "content": story_content,
                "prompt": prompt
            }
        )
        
        if success and response.get('id'):
            self.created_story_id = response['id']
            print(f"   💾 Story saved with ID: {self.created_story_id}")
            return True
        return False

    def test_get_stories(self):
        """Test retrieving all stories"""
        success, response = self.run_test(
            "Get All Stories",
            "GET",
            "stories",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   📚 Retrieved {len(response)} stories")
            return True, response
        return False, []

    def test_get_single_story(self, story_id):
        """Test retrieving a single story"""
        if not story_id:
            print("❌ No story ID provided")
            return False
            
        success, response = self.run_test(
            "Get Single Story",
            "GET",
            f"stories/{story_id}",
            200
        )
        
        if success and response.get('id') == story_id:
            print(f"   📖 Retrieved story: {response.get('title', 'Untitled')}")
            return True
        return False

    def test_delete_story(self, story_id):
        """Test deleting a story"""
        if not story_id:
            print("❌ No story ID provided")
            return False
            
        success, response = self.run_test(
            "Delete Story",
            "DELETE",
            f"stories/{story_id}",
            200
        )
        
        if success and response.get('success'):
            print(f"   🗑️ Story deleted successfully")
            return True
        return False

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test creating status check
        success1, response1 = self.run_test(
            "Create Status Check",
            "POST",
            "status",
            200,
            data={"client_name": "test_client"}
        )
        
        # Test getting status checks
        success2, response2 = self.run_test(
            "Get Status Checks",
            "GET",
            "status",
            200
        )
        
        return success1 and success2

def main():
    print("🚀 Starting Mistral Story Maker API Tests")
    print("=" * 50)
    
    tester = MistralStoryMakerTester()
    
    # Test 1: Basic API Health
    if not tester.test_basic_api_health():
        print("❌ Basic API health check failed, stopping tests")
        return 1

    # Test 2: Status endpoints
    tester.test_status_endpoints()

    # Test 3: Story Generation (Core Mistral AI functionality)
    story_generated, generated_story = tester.test_generate_story()
    if not story_generated:
        print("❌ Story generation failed - Mistral AI integration issue")
        return 1

    # Test 4: Story Completion
    if generated_story:
        tester.test_complete_story(generated_story)

    # Test 5: Chat functionality
    tester.test_chat_functionality()

    # Test 6: Save generated story
    if generated_story:
        story_saved = tester.test_save_story(
            generated_story, 
            "A young wizard discovers a hidden library filled with magical books"
        )
        
        # Test 7: Retrieve all stories
        stories_retrieved, stories_list = tester.test_get_stories()
        
        # Test 8: Get single story
        if tester.created_story_id:
            tester.test_get_single_story(tester.created_story_id)
            
            # Test 9: Delete story (cleanup)
            tester.test_delete_story(tester.created_story_id)

    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed! Mistral Story Maker API is working correctly.")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed.")
        return 1

if __name__ == "__main__":
    sys.exit(main())