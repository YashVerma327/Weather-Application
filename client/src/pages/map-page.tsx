import WeatherMap from "@/components/WeatherMap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MapPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Interactive Weather Map</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Explore real-time weather patterns, precipitation, temperature, and cloud cover on our interactive map.
        </p>
        
        <div className="mt-8">
          <WeatherMap />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}