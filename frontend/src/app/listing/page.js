"use client"
import { useState, useEffect } from 'react';
import Image from "next/image";

export default function Listing() {
  const [loggedInUser, setLoggedInUser] = useState('');

  // 模拟获取登录用户信息
  useEffect(() => {
    // 这里应该替换为实际的检查登录状态和获取用户名的逻辑
    // 例如，从 localStorage 或 cookie 中获取用户名
    const storedUser = localStorage.getItem('username');
    if (storedUser) {
      setLoggedInUser(storedUser);
    }
  }, []);

  return (
    <div>
      <h1>Welcome to Home Page, {loggedInUser ? `a new user ${loggedInUser} logged in` : 'please log in'}</h1>
    </div>
  );
}