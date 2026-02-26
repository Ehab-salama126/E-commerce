import { forgetCode } from "../modules/auth/auth.controller.js";

export const signUpTemp = (link) => `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>>Activate Account</title>
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #e0f7fa, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
      padding: 30px;
      text-align: center;
      width: 90%;
      max-width: 420px;
    }
    h1 {
      color: #0d47a1;
      margin-bottom: 15px;
    }
    p {
      color: #555;
      margin-bottom: 25px;
      font-size: 15px;
    }
    a.button {
      background-color: #0d47a1;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 16px;
      text-decoration: none;
      display: inline-block;
      transition: 0.3s;
    }
    a.button:hover {
      background-color: #1565c0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Activate Account</h1>
    <p>TO Activate your Account please click this Button</p>
    <a href="${link}" class="button">Activate Account</a>
  </div>
</body>
</html>
`;

export const resetPassTemp = (forgetCode) => `
<!DOCTYPE html>
<html lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password</title>
  <style>
    body {
      font-family: 'Cairo', sans-serif;
      background: linear-gradient(135deg, #e0f7fa, #ffffff);
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
    }
    .container {
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
      padding: 30px;
      text-align: center;
      width: 90%;
      max-width: 420px;
    }
    h1 {
      color: #0d47a1;
      margin-bottom: 15px;
    }
    p {
      color: #555;
      margin-bottom: 25px;
      font-size: 15px;
    }
    a.button {
      background-color: #0d47a1;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 12px 20px;
      font-size: 16px;
      text-decoration: none;
      display: inline-block;
      transition: 0.3s;
    }
    a.button:hover {
      background-color: #1565c0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1> Reset Password </h1>
    <p>${forgetCode}</p>
    
  </div>
</body>
</html>
`;
