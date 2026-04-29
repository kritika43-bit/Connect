import { ArrowRight, Users, Calendar, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    name: 'Alumni Directory',
    description: 'Connect with graduates across the globe. Find mentors and mentees.',
    icon: Users,
  },
  {
    name: 'Exclusive Events',
    description: 'Get invited to exclusive networking events and webinars.',
    icon: Calendar,
  },
  {
    name: 'Career Opportunities',
    description: 'Access a private job board with opportunities posted by alumni.',
    icon: Briefcase,
  },
];

export default function Home() {
  return (
    <div className="relative isolate pt-14">
      {/* Background glowing blobs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>
      
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-secondary-900 sm:text-6xl text-gradient">
              Your Lifelong Connection to Excellence
            </h1>
            <p className="mt-6 text-lg leading-8 text-secondary-600">
              Join the official Alumni Management Portal. Reconnect with old friends, expand your professional network, and give back to your community in a modern, seamless way.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/register" className="rounded-full bg-primary-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/30 hover:bg-primary-500 hover:scale-105 transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 flex items-center gap-2">
                Get started <ArrowRight size={16} />
              </Link>
              <Link to="/directory" className="text-sm font-semibold leading-6 text-secondary-900 hover:text-primary-600 transition-colors">
                Browse Directory <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col glass p-8 rounded-2xl hover:-translate-y-2 transition-transform duration-300 cursor-pointer">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-secondary-900">
                    <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary-600/10">
                      <feature.icon className="h-6 w-6 text-primary-600" aria-hidden="true" />
                    </div>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-secondary-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
