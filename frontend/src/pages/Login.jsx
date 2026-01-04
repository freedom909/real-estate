import GoogleSignInButton from '../components/GoogleSignInButton';
import GithubSignInButton from '../components/GithubSignInButton';
import FacebookSignInButton from '../components/FacebookSignInButton';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose your preferred login method
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <GoogleSignInButton />
          <GithubSignInButton />
          <FacebookSignInButton />
        </div>
      </div>
    </div>
  );
}