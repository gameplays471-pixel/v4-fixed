import { NextResponse } from "next/server";

// Simula dados de um dashboard/estatísticas
const mockData = {
  stats: {
    users: 1247,
    sessions: 8432,
    revenue: 52840,
    growth: 12.5,
  },
  activities: [
    { id: "1", title: "Treino de Peito", type: "strength", duration: 45, status: "completed", date: "2024-01-15" },
    { id: "2", title: "Cardio Intenso", type: "cardio", duration: 30, status: "completed", date: "2024-01-14" },
    { id: "3", title: "Pernas - Agachamentos", type: "strength", duration: 50, status: "in_progress", date: "2024-01-15" },
    { id: "4", title: "Yoga e Alongamento", type: "flexibility", duration: 25, status: "pending", date: "2024-01-16" },
    { id: "5", title: "Costas e Bíceps", type: "strength", duration: 55, status: "pending", date: "2024-01-17" },
    { id: "6", title: "HIIT Session", type: "cardio", duration: 20, status: "pending", date: "2024-01-18" },
  ],
};

export async function GET(request: Request) {
  // Simula delay de rede (200-500ms)
  const delay = Math.floor(Math.random() * 300) + 200;
  await new Promise((resolve) => setTimeout(resolve, delay));

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  if (type === "stats") {
    return NextResponse.json(mockData.stats);
  }

  if (type === "activities") {
    return NextResponse.json(mockData.activities);
  }

  // Endpoint para simular erro (para demonstrar tratamento de erro)
  if (type === "error") {
    const errorType = searchParams.get("errorType") || "500";
    const statusCodes: Record<string, number> = {
      "400": 400,
      "401": 401,
      "403": 403,
      "404": 404,
      "422": 422,
      "429": 429,
      "500": 500,
      "502": 502,
      "503": 503,
    };
    
    const statusCode = statusCodes[errorType] || 500;
    return NextResponse.json(
      { 
        message: `Erro simulado (${statusCode}) para teste`,
        code: "SIMULATED_ERROR" 
      },
      { status: statusCode }
    );
  }

  return NextResponse.json(mockData);
}
