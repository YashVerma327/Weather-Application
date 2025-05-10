import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeather } from "@/hooks/use-weather";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { MapPin, Plus, Eye, Trash } from "lucide-react";
import { SavedLocation } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function SavedLocations() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { setCurrentLocation } = useWeather();
  
  const { data: locations, isLoading } = useQuery<SavedLocation[]>({
    queryKey: ["/api/locations"],
    enabled: !!user,
  });

  const deleteLocationMutation = useMutation({
    mutationFn: async (locationId: number) => {
      await apiRequest("DELETE", `/api/locations/${locationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location deleted",
        description: "The location has been removed from your saved locations.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting location",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSelectLocation = (location: SavedLocation) => {
    setCurrentLocation({
      name: location.name,
      lat: parseFloat(location.lat),
      lon: parseFloat(location.lon),
      country: location.country,
    });
  };

  const handleDeleteLocation = (locationId: number) => {
    deleteLocationMutation.mutate(locationId);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden mb-8">
      <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <CardTitle className="text-xl font-bold">Saved Locations</CardTitle>
        <Button variant="ghost" className="text-primary hover:text-primary-dark">
          <Plus className="h-4 w-4 mr-1" />
          Add Location
        </Button>
      </CardHeader>
      
      <CardContent className="p-0">
        {!user ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">Sign in to save your favorite locations</p>
            <Button variant="link" asChild>
              <a href="/auth">Sign In</a>
            </Button>
          </div>
        ) : isLoading ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center justify-between">
                <Skeleton className="h-14 w-40" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : !locations || locations.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p className="mb-2">You haven't saved any locations yet</p>
            <p className="text-sm">Search for a location and click the heart icon to save it</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {locations.map((location) => (
              <div 
                key={location.id} 
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <div className="flex items-center">
                  <MapPin className="text-primary mr-3 h-5 w-5" />
                  <div>
                    <h4 className="font-medium">{location.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {location.city}, {location.country}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-primary"
                    onClick={() => handleSelectLocation(location)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-gray-400 hover:text-destructive"
                    onClick={() => handleDeleteLocation(location.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
