import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FireRiskAnalysis } from "./FireRiskAnalysis";
import { IrrigationAnalysis } from "./IrrigationAnalysis";
import { RainfallAnalysis } from "./RainfallAnalysis";
import { Brain, Droplets, CloudRain, Flame } from "lucide-react";

interface AIAnalysisTabsProps {
  temperature: number;
  gasLevel: number;
  humidity: number;
  sensorHistory: Array<{ temperature: number; gasLevel: number }>;
  humidityHistory: Array<{ time: string; humidity: number; temperature: number }>;
  rainfallData: {
    isRaining: boolean;
    rainIntensity: number;
  };
  rainfallHistory: Array<{ time: string; intensity: number; isRaining: boolean }>;
}

export const AIAnalysisTabs = ({
  temperature,
  gasLevel,
  humidity,
  sensorHistory,
  humidityHistory,
  rainfallData,
  rainfallHistory
}: AIAnalysisTabsProps) => {
  const [activeTab, setActiveTab] = useState("fire");

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-3">
          <Brain className="w-6 h-6 text-primary" />
          <span>AI Phân Tích Thông Minh</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="fire" className="flex items-center gap-2">
              <Flame className="w-4 h-4" />
              <span className="hidden sm:inline">Nguy Cơ Cháy</span>
              <span className="sm:hidden">Cháy</span>
            </TabsTrigger>
            <TabsTrigger value="irrigation" className="flex items-center gap-2">
              <Droplets className="w-4 h-4" />
              <span className="hidden sm:inline">Độ Ẩm Đất</span>
              <span className="sm:hidden">Đất</span>
            </TabsTrigger>
            <TabsTrigger value="rainfall" className="flex items-center gap-2">
              <CloudRain className="w-4 h-4" />
              <span className="hidden sm:inline">Thời Tiết</span>
              <span className="sm:hidden">Mưa</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="fire" className="mt-0">
            <FireRiskAnalysis 
              temperature={temperature}
              gasLevel={gasLevel}
              history={sensorHistory}
            />
          </TabsContent>

          <TabsContent value="irrigation" className="mt-0">
            <IrrigationAnalysis
              humidity={humidity}
              temperature={temperature}
              history={humidityHistory}
            />
          </TabsContent>

          <TabsContent value="rainfall" className="mt-0">
            <RainfallAnalysis
              isRaining={rainfallData.isRaining}
              rainIntensity={rainfallData.rainIntensity}
              history={rainfallHistory}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
