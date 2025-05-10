import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWeather } from "@/hooks/use-weather";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WeatherAlerts from "@/components/WeatherAlerts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Bell, Settings } from "lucide-react";
import { Link } from "wouter";

export default function AlertsPage() {
  const { user } = useAuth();
  const { currentLocation } = useWeather();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Weather Alerts</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Stay informed about severe weather conditions
            </p>
          </div>
          
          {user && (
            <Button className="mt-4 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Create Alert
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Alerts</TabsTrigger>
            {user && <TabsTrigger value="personal">My Alerts</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="current">
            <Card>
              <CardHeader>
                <CardTitle>
                  {currentLocation ? `Alerts for ${currentLocation.name}` : 'Location Alerts'}
                </CardTitle>
                <CardDescription>
                  Active weather alerts and warnings for your current location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeatherAlerts />
              </CardContent>
            </Card>
          </TabsContent>
          
          {user && (
            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>My Alert Settings</CardTitle>
                  <CardDescription>
                    Your personalized alert settings and notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This would be populated with user-specific alerts from the database */}
                  <div className="text-center py-8">
                    <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Custom Alerts Set</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      You haven't set up any custom weather alerts yet
                    </p>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Set Up Your First Alert
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
        
        {!user && (
          <Card className="mt-8">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Bell className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-lg font-medium mb-2">Create Personalized Alerts</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Sign in to create custom alerts for your saved locations
                </p>
                <Link href="/auth">
                  <Button>Sign In</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
      
      <Footer />
    </div>
  );
}