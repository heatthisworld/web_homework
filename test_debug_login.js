// 测试debug login功能的脚本
const fetch = require('node-fetch');

async function testDebugLogin() {
  try {
    const response = await fetch('http://localhost:8080/api/debug/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: '3P',
        password: 'password' // debug login不需要实际密码验证
      }),
      credentials: 'include' // 包含cookies
    });

    const responseText = await response.text();
    console.log('Response Status:', response.status);
    console.log('Response Headers:', Object.fromEntries(response.headers));
    console.log('Response Body:', responseText);

    if (response.ok) {
      const data = JSON.parse(responseText);
      if (data.code === 0 && data.data) {
        console.log('✅ Debug Login Successful!');
        console.log('Token:', data.data.token);
        console.log('Username:', data.data.username);
        console.log('Role:', data.data.role);
        return true;
      } else {
        console.log('❌ Debug Login Failed - Invalid response format');
        return false;
      }
    } else {
      console.log('❌ Debug Login Failed - HTTP Error');
      return false;
    }
  } catch (error) {
    console.log('❌ Debug Login Failed - Exception:', error.message);
    return false;
  }
}

testDebugLogin();
