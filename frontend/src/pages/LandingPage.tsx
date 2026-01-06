import { Link } from 'react-router-dom';
import { Button } from '@/ui/components/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to FoodEval
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            A comprehensive food evaluation and assessment system
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-16 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Secure</h3>
              <p className="text-gray-600">
                Enterprise-grade security with role-based access control
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Efficient</h3>
              <p className="text-gray-600">
                Streamlined workflows for food evaluation processes
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Reliable</h3>
              <p className="text-gray-600">
                Built for offline support and seamless synchronization
              </p>
            </div>
          </div>

          <Link to="/login">
            <Button variant="primary" className="text-lg px-8 py-3">
              Get Started - Login
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
