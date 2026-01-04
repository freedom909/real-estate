"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import localAuthService from '@/userService/localAuthService';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email || !formData.password || !formData.name) {
      setError('请填写所有必填字段');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不匹配');
      return false;
    }

    if (formData.password.length < 8) {
      setError('密码长度至少为8个字符');
      return false;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('密码必须包含至少一个大写字母');
      return false;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('密码必须包含至少一个数字');
      return false;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
      setError('密码必须包含至少一个特殊字符');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    await handleRegister({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      nickname: formData.nickname || formData.name,
      role: formData.role || 'GUEST',
      picture: formData.picture || "https://www.gravatar.com/avatar/?d=mp"
    });
    setLoading(false);
  };


  const handleRegister = async (formData) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success) {
        setError(data.message || '注册失败');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      setError(err.message || '注册失败');
    }
  };



  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      <div className="w-full max-w-xs bg-blue-600 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-white text-center">
          创建新账户
        </h1>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <input
              type="email"
              name="email"
              placeholder="电子邮箱"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="text"
              name="name"
              placeholder="姓名"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="text"
              name="nickname"
              placeholder="昵称（可选）"
              value={formData.nickname}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="text"
              name="picture"
              placeholder="头像"
              value={formData.picture}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="text"
              name="role"
              placeholder="role"
              value={formData.role ||"Guest"}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              name="password"
              placeholder="密码"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="确认密码"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-blue-700 text-white placeholder-blue-300 border-blue-500 focus:border-blue-400 focus:ring-blue-400"
            />
          </div>

          {error && (
            <div className="text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-2 rounded text-white ${
              loading ? 'bg-blue-400' : 'bg-blue-800 hover:bg-blue-900'
            } transition-colors`}
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link 
            href="/login" 
            className="text-blue-200 hover:text-white text-sm transition-colors"
          >
            已有账号？立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}