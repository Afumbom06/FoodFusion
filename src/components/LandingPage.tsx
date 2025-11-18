import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { 
  UtensilsCrossed, Menu as MenuIcon, Check, TrendingUp, 
  ShoppingCart, BarChart3, Users, Package, Clock, Shield, 
  Globe, ChevronRight, Star, ArrowRight, Play, Zap,
  Store, Brain, DollarSign, Smartphone, CheckCircle2
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    restaurantName: '',
    branches: '1',
    demoDate: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: '',
        email: '',
        restaurantName: '',
        branches: '1',
        demoDate: '',
        message: ''
      });
    }, 3000);
  };

  const scrollToDemo = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl">RMS</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition-colors">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors">Contact</a>
              <Button onClick={onGetStarted} variant="outline">Sign In</Button>
              <Button onClick={onGetStarted} className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <MenuIcon className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-amber-50 via-orange-50 to-white">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
            {/* Left Content */}
            <motion.div 
              className="space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Star className="w-4 h-4 fill-white" />
                <span className="text-sm">Trusted by 500+ restaurants in Cameroon</span>
              </motion.div>
              
              <motion.h1 
                className="text-5xl lg:text-7xl leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Elevate Your Restaurant
                <span className="block text-blue-600 mt-2">To New Heights</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl text-gray-700 leading-relaxed max-w-xl mx-auto lg:mx-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                Manage orders, inventory, staff, and tables effortlessly. Built for African restaurants with FCFA currency and bilingual support.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                <Button onClick={scrollToDemo} size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg h-14 px-8 shadow-xl hover:shadow-2xl transition-all">
                  Request a Demo
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button onClick={onGetStarted} size="lg" variant="outline" className="text-lg h-14 px-8 border-2 border-blue-600 text-blue-600 hover:bg-blue-50">
                  Start Free Trial
                </Button>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-8 pt-4 justify-center lg:justify-start flex-wrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">Setup in 5 minutes</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Food Image Grid with Animations */}
            <div className="relative h-[500px] lg:h-[600px]">
              {/* Main large image */}
              <motion.div
                className="absolute top-0 right-0 w-[280px] h-[280px] lg:w-[350px] lg:h-[350px] rounded-3xl overflow-hidden shadow-2xl z-20"
                initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1760559159152-fd099c4af89e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwZm9vZCUyMHBsYXR0ZXJ8ZW58MXx8fHwxNzYyODYxOTY3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Delicious African Cuisine"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Secondary image - bottom left */}
              <motion.div
                className="absolute bottom-20 left-0 w-[240px] h-[240px] lg:w-[280px] lg:h-[280px] rounded-3xl overflow-hidden shadow-2xl z-10"
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1737141499784-3d61670ec870?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZWxpY2lvdXMlMjBmb29kJTIwcGxhdGUlMjBnb3VybWV0fGVufDF8fHx8MTc2Mjk2NDAwNHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Gourmet Dish"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Tertiary image - top left */}
              <motion.div
                className="absolute top-32 left-20 w-[200px] h-[200px] lg:w-[240px] lg:h-[240px] rounded-3xl overflow-hidden shadow-2xl z-30"
                initial={{ opacity: 0, scale: 0.8, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1717838206417-c4fe2b9fb043?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGNvb2tpbmclMjBjaGVmfGVufDF8fHx8MTc2Mjk2NDAwNHww&ixlib=rb-4.1.0&q=80&w=1080"
                  alt="Chef Cooking"
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Floating badge - stats */}
              <motion.div
                className="absolute bottom-0 right-16 bg-white rounded-2xl shadow-2xl p-6 z-40 border border-gray-100"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl text-green-600">50K+</div>
                    <div className="text-sm text-gray-600">Orders Daily</div>
                  </div>
                </div>
              </motion.div>

              {/* Floating badge - rating */}
              <motion.div
                className="absolute top-10 left-0 bg-white rounded-2xl shadow-xl p-4 z-40 border border-gray-100"
                initial={{ opacity: 0, x: -20, y: 0 }}
                animate={{ 
                  opacity: 1, 
                  x: 0,
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { delay: 0.9, duration: 0.8 },
                  x: { delay: 0.9, duration: 0.8 },
                  y: {
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1.5
                  }
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm">4.9/5.0</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Features</Badge>
            <h2 className="text-4xl mb-4">Everything You Need to Run Your Restaurant</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful features designed for the modern restaurant owner
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MenuIcon,
                title: 'Menu Management',
                description: 'Create, update, and sync menus across all branches with real-time pricing updates'
              },
              {
                icon: ShoppingCart,
                title: 'POS & Billing',
                description: 'Fast, intuitive point-of-sale with digital receipts and multiple payment methods'
              },
              {
                icon: Store,
                title: 'Multi-Branch Control',
                description: 'Manage unlimited restaurants from one centralized dashboard with branch analytics'
              },
              {
                icon: BarChart3,
                title: 'Analytics & Reports',
                description: 'Real-time insights on sales, staff performance, and inventory levels'
              },
              {
                icon: Users,
                title: 'Staff Management',
                description: 'Track shifts, attendance, roles, and payroll with ease'
              },
              {
                icon: Package,
                title: 'Inventory Tracking',
                description: 'Automated stock alerts, supplier management, and waste tracking'
              },
              {
                icon: Clock,
                title: 'Table Reservations',
                description: 'Manage bookings, track table availability, and reduce wait times'
              },
              {
                icon: TrendingUp,
                title: 'Customer Loyalty',
                description: 'Build customer relationships with loyalty programs and rewards'
              },
              {
                icon: Shield,
                title: 'Role-Based Access',
                description: 'Secure your data with customizable permissions for staff, managers, and admins'
              }
            ].map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-all border-2 hover:border-blue-200">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1613274554329-70f997f5789f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYyOTEwNjI2fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Modern Restaurant"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="space-y-8">
              <div>
                <Badge className="mb-4 bg-blue-100 text-blue-700">Why Choose Us</Badge>
                <h2 className="text-4xl mb-4">Built for Cameroon Restaurants</h2>
                <p className="text-xl text-gray-600">
                  We understand the unique needs of restaurant owners in Cameroon and across Africa
                </p>
              </div>
              <div className="space-y-6">
                {[
                  {
                    icon: Zap,
                    title: 'Fast Setup',
                    description: 'Go live in minutes with our intuitive setup wizard'
                  },
                  {
                    icon: Globe,
                    title: 'Cloud-Based',
                    description: 'Access from anywhere — desktop, tablet, or mobile'
                  },
                  {
                    icon: DollarSign,
                    title: 'FCFA Currency',
                    description: 'Built-in support for Central African CFA franc and multi-currency'
                  },
                  {
                    icon: Brain,
                    title: 'Bilingual Support',
                    description: 'Full support for both English and French languages'
                  },
                  {
                    icon: Shield,
                    title: 'Secure & Reliable',
                    description: 'Bank-level security with automated backups'
                  },
                  {
                    icon: Smartphone,
                    title: 'Mobile Optimized',
                    description: 'Works perfectly on any device, anywhere'
                  }
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg mb-1">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Branch Highlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-white text-blue-600">Multi-Branch Management</Badge>
          <h2 className="text-4xl mb-6">Scale Your Restaurant Empire</h2>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto mb-12">
            Whether you manage one restaurant or twenty, our platform keeps every branch connected — unified menus, shared analytics, centralized staff management, and real-time inventory synchronization across all locations.
          </p>
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            {[
              { number: '500+', label: 'Active Restaurants' },
              { number: '50K+', label: 'Orders Daily' },
              { number: '99.9%', label: 'Uptime' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl mb-2">{stat.number}</div>
                <div className="text-blue-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">How It Works</Badge>
            <h2 className="text-4xl mb-4">Get Started in 3 Simple Steps</h2>
            <p className="text-xl text-gray-600">From signup to serving customers in minutes</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Sign Up & Add Your Restaurant',
                description: 'Create your account and add your restaurant details, branches, and locations',
                icon: Store
              },
              {
                step: '02',
                title: 'Set Up Menus, Tables & Staff',
                description: 'Import your menu items, configure tables, and invite your team members',
                icon: MenuIcon
              },
              {
                step: '03',
                title: 'Start Taking Orders',
                description: 'Go live with your POS system and start managing orders in real-time',
                icon: ShoppingCart
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full hover:shadow-xl transition-all">
                  <CardContent className="pt-6">
                    <div className="text-6xl text-blue-100 mb-4">{item.step}</div>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl mb-3">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
                {index < 2 && (
                  <ChevronRight className="hidden md:block absolute -right-4 top-1/2 transform -translate-y-1/2 text-blue-300 w-8 h-8" />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button onClick={scrollToDemo} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Request a Live Demo
              <Play className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Pricing</Badge>
            <h2 className="text-4xl mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your restaurant size</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: '14-day trial',
                target: 'Perfect for small cafés',
                features: [
                  '1 branch location',
                  'Up to 2 staff members',
                  'Basic POS system',
                  'Menu management',
                  'Sales reports',
                  'Email support'
                ],
                cta: 'Start Free Trial',
                popular: false
              },
              {
                name: 'Professional',
                price: '25,000',
                period: 'FCFA/month',
                target: 'For growing restaurants',
                features: [
                  'Up to 3 branches',
                  'Unlimited staff',
                  'Full POS features',
                  'Inventory management',
                  'Advanced analytics',
                  'Table reservations',
                  'Customer loyalty program',
                  'Priority support'
                ],
                cta: 'Get Started',
                popular: true
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'Contact us',
                target: 'For restaurant chains',
                features: [
                  'Unlimited branches',
                  'Unlimited staff',
                  'All Pro features',
                  'Custom integrations',
                  'Dedicated account manager',
                  'White-label options',
                  '24/7 phone support',
                  'On-site training'
                ],
                cta: 'Request Quote',
                popular: false
              }
            ].map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-blue-600 shadow-xl' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.target}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl">{plan.price}</span>
                    {plan.price !== 'Free' && plan.price !== 'Custom' && (
                      <span className="text-gray-600"> FCFA</span>
                    )}
                    <div className="text-sm text-gray-600 mt-1">{plan.period}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={onGetStarted}
                    className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Testimonials</Badge>
            <h2 className="text-4xl mb-4">Loved by Restaurant Owners</h2>
            <p className="text-xl text-gray-600">See what our customers have to say</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Chef Marcel Touré',
                restaurant: 'La Table de Douala',
                location: 'Douala, Cameroon',
                image: 'https://images.unsplash.com/photo-1740727665746-cfe80ababc23?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVmJTIwY29va2luZyUyMGtpdGNoZW58ZW58MXx8fHwxNzYyOTM2NTU1fDA&ixlib=rb-4.1.0&q=80&w=1080',
                text: 'Since using this system, managing my kitchen and sales has become effortless. The real-time inventory tracking alone has saved us thousands each month. Highly recommend!'
              },
              {
                name: 'Amina Kamdem',
                restaurant: 'Café Chez Amina',
                location: 'Yaoundé, Cameroon',
                image: 'https://images.unsplash.com/photo-1762015669851-4098e655ec87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwc3RhZmYlMjBzZXJ2aW5nfGVufDF8fHx8MTc2Mjk2MzAwOXww&ixlib=rb-4.1.0&q=80&w=1080',
                text: 'The bilingual interface is perfect for our team. Staff love how easy the POS is to use, and I love the detailed analytics. Best investment we\'ve made for our restaurant!'
              },
              {
                name: 'Jean-Paul Mballa',
                restaurant: 'Saveur Africaine Group',
                location: '5 Locations across Cameroon',
                image: 'https://images.unsplash.com/photo-1613274554329-70f997f5789f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBtb2Rlcm58ZW58MXx8fHwxNzYyOTEwNjI2fDA&ixlib=rb-4.1.0&q=80&w=1080',
                text: 'Managing multiple branches was a nightmare before RMS. Now I can see performance across all locations in real-time. The multi-branch features are game-changing!'
              }
            ].map((testimonial, index) => (
              <Card key={index} className="hover:shadow-lg transition-all">
                <CardContent className="pt-6">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div>{testimonial.name}</div>
                      <div className="text-sm text-gray-600">{testimonial.restaurant}</div>
                      <div className="text-xs text-gray-500">{testimonial.location}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700">Get In Touch</Badge>
            <h2 className="text-4xl mb-4">Request a Free Demo</h2>
            <p className="text-xl text-gray-600">
              See RMS in action. Book a personalized demo with our team
            </p>
          </div>
          <Card>
            <CardContent className="pt-6">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl mb-2">Thank You!</h3>
                  <p className="text-gray-600">We'll contact you shortly to schedule your demo.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@restaurant.com"
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="restaurant">Restaurant Name *</Label>
                      <Input
                        id="restaurant"
                        required
                        value={formData.restaurantName}
                        onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                        placeholder="My Restaurant"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="branches">Number of Branches *</Label>
                      <Input
                        id="branches"
                        type="number"
                        min="1"
                        required
                        value={formData.branches}
                        onChange={(e) => setFormData({ ...formData, branches: e.target.value })}
                        placeholder="1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demoDate">Preferred Demo Date</Label>
                    <Input
                      id="demoDate"
                      type="date"
                      value={formData.demoDate}
                      onChange={(e) => setFormData({ ...formData, demoDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Message (Optional)</Label>
                    <Textarea
                      id="message"
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your restaurant and any specific requirements..."
                    />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700">
                    Book My Free Demo
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <UtensilsCrossed className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl">RMS</span>
              </div>
              <p className="text-gray-400 text-sm">
                All-in-one restaurant management system for Cameroon and beyond.
              </p>
            </div>
            <div>
              <h3 className="mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4">Contact</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Email: info@rms-cameroon.com</li>
                <li>Phone: +237 xxx xxx xxx</li>
                <li>WhatsApp: +237 xxx xxx xxx</li>
                <li className="flex gap-2 pt-2">
                  <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🇬🇧</span>
                  <span className="text-2xl cursor-pointer hover:scale-110 transition-transform">🇫🇷</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 Restaurant Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
