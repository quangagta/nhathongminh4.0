import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
  title: string;
  description: string;
  gradient?: string;
}

export const PageHeader = ({ title, description, gradient = "from-primary to-accent" }: PageHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="mb-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate("/")}
        className="mb-4 hover:bg-muted/50 transition-all"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Quay lại
      </Button>
      
      <h1 className={`text-4xl font-bold mb-2 bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
        {title}
      </h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
