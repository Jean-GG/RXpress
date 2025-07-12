import React from 'react';
import { CheckCircle, Clock, Star, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <div className="relative">
        <div 
          className="h-screen bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.pexels.com/photos/3806288/pexels-photo-3806288.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white px-6 max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                TALACHEROS Y<br />
                <span className="text-orange-500">MECÁNICOS</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 font-light">
                Solicita nuestros servicios confiables<br />
                las 24 horas del día, los 7 días de la<br />
                semana.
              </p>
              
              {/* Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex items-center justify-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <span className="text-lg">Profesionales calificados</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Clock className="w-6 h-6 text-blue-500" />
                  <span className="text-lg">Rapidez y atención inmediata</span>
                </div>
                <div className="flex items-center justify-center space-x-3">
                  <Star className="w-6 h-6 text-yellow-500" />
                  <span className="text-lg">Elección autónoma guiada por reseñas</span>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
              >
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Sobre Nosotros</h2>
          
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            En RXpress, somos una plataforma diseñada para facilitar la conexión entre profesionales del 
            transporte y expertos en servicios mecánicos, vulcanización y más. Nuestro objetivo es 
            garantizar soluciones rápidas y confiables para que los conductores puedan continuar su camino 
            sin contratiempos.
          </p>
          
          <p className="text-lg text-gray-700 mb-12 leading-relaxed">
            Creemos en la innovación y la tecnología para optimizar la asistencia en carretera, ofreciendo 
            herramientas como cotizaciones inmediatas, seguimiento en tiempo real y un equipo altamente 
            calificado dispuesto a ayudarte cuando más lo necesites.
          </p>

          <h3 className="text-3xl font-bold text-gray-900 mb-8">Nuestros Servicios</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Reparación de llantas (Vulcanización)</h4>
              <p className="text-gray-600 text-sm">Servicio especializado en reparación y cambio de neumáticos</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Cambio de aceite</h4>
              <p className="text-gray-600 text-sm">Mantenimiento preventivo con aceites de calidad</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Ajustes de frenos</h4>
              <p className="text-gray-600 text-sm">Revisión y reparación del sistema de frenos</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Revisión de suspensión</h4>
              <p className="text-gray-600 text-sm">Diagnóstico y reparación de sistema de suspensión</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">Nuestro Equipo</h3>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Conoce a los profesionales que hacen posible nuestro servicio de excelencia
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Sofía Martínez"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Sofía Martínez</h4>
                <p className="text-orange-600 font-medium">Directora General</p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184318/pexels-photo-3184318.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Lucía Hernández"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Lucía Hernández</h4>
                <p className="text-orange-600 font-medium">Jefa de Operaciones</p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Ana López"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Ana López</h4>
                <p className="text-orange-600 font-medium">Especialista en Frenos</p>
              </div>
            </div>

            {/* Team Member 4 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Pedro García"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Pedro García</h4>
                <p className="text-orange-600 font-medium">Experto en Vulcanización</p>
              </div>
            </div>

            {/* Team Member 5 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/3184427/pexels-photo-3184427.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="María González"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">María González</h4>
                <p className="text-orange-600 font-medium">Especialista en Transmisión</p>
              </div>
            </div>

            {/* Team Member 6 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Carlos Mendoza"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Carlos Mendoza</h4>
                <p className="text-orange-600 font-medium">Técnico en Diagnóstico</p>
              </div>
            </div>

            {/* Team Member 7 */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-square overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&dpr=2"
                  alt="Roberto Vázquez"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Roberto Vázquez</h4>
                <p className="text-orange-600 font-medium">Coordinador de Servicios</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;