// Base de dados com TODOS os exercícios mais usados nas academias do Brasil
// Cada exercício contém: nome, grupo muscular, equipamento, categoria, nível,
// descrição, execução passo a passo, erros comuns e dicas

export type ExerciseData = {
  name: string;
  slug: string;
  muscleGroup: string;
  secondaryMuscles?: string;
  equipment?: string;
  category: string;
  equipmentType?: string;
  level: string;
  description?: string;
  executionSteps?: string;
  commonMistakes?: string;
  tips?: string;
  images?: string[];
};

export const exercisesData: ExerciseData[] = [
{
    name: "Supino Reto com Barra",
    slug: "supino-reto-barra",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício clássico para desenvolvimento do peitoral, considerado o rei dos exercícios de empurrão. Trabalha principalmente o peitoral maior, com participação significativa de tríceps e deltoide anterior.",
    executionSteps:
      "1. Deite-se no banco reto com os pés firmes no chão.\n2. Segure a barra com pegada um pouco mais aberta que a largura dos ombros.\n3. Retire a barra do suporte e posicione-a sobre o peito.\n4. Desça a barra controladamente até tocar o peito na altura dos mamilos.\n5. Empurre a barra de volta à posição inicial até estender os braços.\n6. Repita pelo número de repetições desejado.",
    commonMistakes:
      "Arquear excessivamente a lombar; quicar a barra no peito; descer muito rápido sem controle; não tocar o peito; abrir demais os cotovelos.",
    tips: "Mantenha as escápulas retraídas durante todo o movimento para proteger os ombros. Use o peito para empurrar, não os braços.",
  },
{
    name: "Supino Reto com Halteres",
    slug: "supino-reto-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Variação do supino com halteres que permite maior amplitude de movimento e recrutamento unilateral dos músculos do peito. Excelente para corrigir assimetrias.",
    executionSteps:
      "1. Sente-se no banco reto com os halteres apoiados nas coxas.\n2. Deite-se levando os halteres para a posição inicial acima do peito.\n3. Com os cotovelos levemente flexionados, desça os halteres em arco até a altura do peito.\n4. Empurre os halteres de volta à posição inicial contraindo o peito.\n5. Repita pelo número de repetições desejado.",
    commonMistakes:
      "Bater os halteres no topo; descer rápido demais; não alinhar os halteres; arquear a lombar.",
    tips: "Mantenha os pulsos retos e firmes. Controle a descida em 2-3 segundos para máxima ativação.",
  },
{
    name: "Supino Inclinado com Barra",
    slug: "supino-inclinado-barra",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Foca na porção clavicular (superior) do peitoral maior. Essencial para desenvolvimento completo do peito, dando aquele aspecto de 'peito cheio' por cima.",
    executionSteps:
      "1. Ajuste o banco em inclinação de 30 a 45 graus.\n2. Deite-se e segure a barra com pegada um pouco mais aberta que os ombros.\n3. Retire a barra do suporte e posicione sobre o peito superior.\n4. Desça a barra controladamente até tocar a porção superior do peito.\n5. Empurre a barra de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Inclinar o banco mais que 45 graus (vira exercício de ombro); jogar a barra no peito; não controlar a descida.",
    tips: "Inclinação de 30° é o ideal para focar no peito sem transferir carga para o deltoide.",
  },
{
    name: "Supino Inclinado com Halteres",
    slug: "supino-inclinado-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão com halteres do supino inclinado, oferecendo maior amplitude e trabalho unilateral. Excelente para hipertrofia da porção superior do peito.",
    executionSteps:
      "1. Ajuste o banco em inclinação de 30 a 45 graus.\n2. Sente-se com os halteres nas coxas e deite-se levando-os para a posição inicial.\n3. Com os braços estendidos acima do peito superior, desça os halteres em arco.\n4. Empurre de volta à posição inicial contraindo o peito superior.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Inclinação muito alta; cotovelos muito abertos; descer assimétrico; arquear lombar.",
    tips: "Use espelho lateral para garantir simetria no movimento de ambos os braços.",
  },
{
    name: "Crucifixo com Halteres",
    slug: "crucifixo-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Exercício de isolamento do peitoral que promove alongamento profundo e contração intensa. Excelente para finalizar o treino de peito.",
    executionSteps:
      "1. Deite-se no banco reto com halteres estendidos acima do peito.\n2. Com cotovelos levemente flexionados, abra os braços em arco amplo.\n3. Desça até sentir alongamento no peito (não desça demais).\n4. Suba os halteres em movimento de 'abraço' contraindo o peito.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Flexionar muito os cotovelos (vira supino); descer além do alongamento confortável; usar carga excessiva.",
    tips: "Imagine que está abraçando uma árvore. Mantenha cotovelos fixos em leve flexão durante todo o movimento.",
  },
{
    name: "Crossover na Polia",
    slug: "crossover-polia",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Exercício de isolamento com cabos que mantém tensão constante no peitoral. Excelente para finalização e definição do peito.",
    executionSteps:
      "1. Posicione-se entre as polias altas.\n2. Segure as alças com palmas voltadas para baixo.\n3. Incline levemente o tronco à frente com um passo à frente.\n4. Em movimento de abraço, cruze as mãos à frente do corpo.\n5. Volte controladamente até sentir alongamento no peito.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso e virar empurrão; não cruzar as mãos; jogar o corpo para frente.",
    tips: "Para máxima contração, cruze completamente as mãos na frente do corpo e segure por 1 segundo.",
  },
{
    name: "Flexão de Braço",
    slug: "flexao-braco",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Core, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício fundamental usando o peso do corpo. Trabalha peito, ombros, tríceps e core. Pode ser feito em qualquer lugar.",
    executionSteps:
      "1. Apoie as mãos no chão um pouco mais abertas que os ombros.\n2. Mantenha o corpo reto da cabeça aos calcanhares.\n3. Desça o peito até quase tocar o chão.\n4. Empurre de volta à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Subir o quadril; deixar a cabeça caída; não descer o suficiente; abrir cotovelos em 90°.",
    tips: "Mantenha o core firme como uma prancha. Para iniciantes, apoie os joelhos no chão.",
  },
{
    name: "Paralelas (Mergulho)",
    slug: "paralelas-mergulho",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Paralelas",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Exercício avançado usando o peso do corpo nas paralelas. Excelente para peito e tríceps, dependendo da inclinação do tronco.",
    executionSteps:
      "1. Suba nas paralelas e sustente o peso do corpo com braços estendidos.\n2. Incline o tronco levemente à frente para focar no peito.\n3. Desça o corpo flexionando os cotovelos até sentir alongamento no peito.\n4. Empurre de volta à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Descer demais (lesão no ombro); não inclinar o tronco (vira tríceps); balancear o corpo.",
    tips: "Para iniciantes, use a máquina de mergulho assistida. Mantenha os ombros afastados das orelhas.",
  },
{
    name: "Puxada Frontal",
    slug: "puxada-frontal",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Exercício fundamental para latíssimo do dorso (asa). Excelente para iniciantes que ainda não fazem barra fixa. Constrói a largura das costas.",
    executionSteps:
      "1. Sente-se na máquina com as pernas sob as almofadas.\n2. Segure a barra com pegada aberta (mais larga que os ombros).\n3. Puxe a barra até a altura do queixo/peito superior contraindo as costas.\n4. Volte controladamente até estender os braços.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Puxar com os braços em vez das costas; balançar o corpo; descer rápido demais; puxar atrás do pescoço.",
    tips: "Imagine que está fazendo o movimento com os cotovelos, não com as mãos. Incline levemente o tronco para trás.",
  },
{
    name: "Barra Fixa",
    slug: "barra-fixa",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço",
    equipment: "Barra fixa",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Exercício clássico de força e hipertrofia para as costas. Considerado um dos melhores indicadores de força relativa.",
    executionSteps:
      "1. Segure a barra fixa com pegada pronada mais aberta que os ombros.\n2. Ative o core e pendure com braços estendidos.\n3. Puxe o corpo até o queixo passar a barra.\n4. Desça controladamente até extensão completa.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Balancear o corpo; não estender totalmente os braços; puxar com os braços; usar impulso.",
    tips: "Foque em levar os cotovelos para baixo e para trás. Inicie o movimento contraindo as escápulas.",
  },
{
    name: "Remada Curvada com Barra",
    slug: "remada-curvada-barra",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Trapézio, Lombar",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício composto para espessura das costas. Trabalha toda a musculatura das costas, além de exigir estabilização da lombar.",
    executionSteps:
      "1. Segure a barra com pegada pronada na largura dos ombros.\n2. Incline o tronco à frente ~45° mantendo a coluna neutra.\n3. Puxe a barra em direção ao umbigo contraindo as costas.\n4. Volte controladamente até estender os braços.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar a lombar; usar impulso; puxar para o peito; não contrair as escápulas.",
    tips: "Mantenha o core firme e a coluna neutra. O movimento vem das escápulas, não dos braços.",
  },
{
    name: "Remada Baixa na Polia",
    slug: "remada-baixa-polia",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Trapézio",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Remada sentada com cabos, excelente para construir espessura das costas com menor stress na lombar que a remada curvada.",
    executionSteps:
      "1. Sente-se na máquina com os pés nas plataformas.\n2. Segure o triângulo/triapo com braços estendidos.\n3. Mantenha a coluna neutra e tronco levemente inclinado.\n4. Puxe o pegador em direção ao abdômen contraindo as costas.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Balancear o tronco para frente e trás; arredondar as costas; puxar com os braços.",
    tips: "Concentre-se em juntar as escápulas no final do movimento. Mantenha o peito alto.",
  },
{
    name: "Remada com Halter (Serrote)",
    slug: "remada-halter-serrote",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Lombar",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Remada unilateral com halter apoiada no banco. Excelente para trabalhar assimetrias e focar em cada lado individualmente.",
    executionSteps:
      "1. Apoie um joelho e a mão do mesmo lado no banco.\n2. Segure o halter com o braço livre estendido.\n3. Mantenha a coluna paralela ao chão.\n4. Puxe o halter em direção ao quadril contraindo as costas.\n5. Volte controladamente.\n6. Repita e troque de lado.",
    commonMistakes:
      "Girar o tronco; puxar com impulso; não contrair as costas; arredondar a lombar.",
    tips: "Mantenha o ombro relaxado no início e puxe com o cotovelo. Imagine que está puxando uma corda.",
  },
{
    name: "Levantamento Terra",
    slug: "levantamento-terra",
    muscleGroup: "Costas",
    secondaryMuscles: "Glúteos, Posteriores, Trapézio, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Exercício composto completo, trabalha praticamente toda a cadeia posterior. Um dos três levantamentos do powerlifting.",
    executionSteps:
      "1. Com a barra no chão, posicione os pés sob a barra na largura do quadril.\n2. Segure a barra com pegada pronada ou mista, mãos um pouco mais abertas que os joelhos.\n3. Flexione os joelhos, mantenha a coluna neutra e peito alto.\n4. Levante a barra estendendo quadril e joelhos simultaneamente.\n5. Mantenha a barra próxima ao corpo durante todo o movimento.\n6. Desça controladamente.",
    commonMistakes:
      "Arredondar a lombar; levantar o quadril antes dos ombros; jogar a barra para frente; não usar as pernas.",
    tips: "Use calçado raso e firme. A barra deve deslizar pelas canelas. Comece com carga leve para dominar a técnica.",
  },
{
    name: "Pullover com Halter",
    slug: "pullover-halter",
    muscleGroup: "Costas",
    secondaryMuscles: "Peito, Serrátil",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Exercício clássico que trabalha costas e peito simultaneamente. Excelente para expansão da caixa torácica e serrátil.",
    executionSteps:
      "1. Deite-se no banco com a cabeça na borda, segurando um halter com as duas mãos sobre o peito.\n2. Mantenha os braços levemente flexionados.\n3. Leve o halter para trás, acima da cabeça, até quase tocar o chão.\n4. Volte o halter para a posição inicial contraindo as costas e peito.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar carga excessiva; arquear a lombar; soltar a respiração; flexionar muito os cotovelos.",
    tips: "Respire fundo ao descer e solte ao subir. Mantenha os quadris baixos.",
  },
{
    name: "Face Pull",
    slug: "face-pull",
    muscleGroup: "Costas",
    secondaryMuscles: "Deltoide Posterior, Romboides",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Exercício essencial para saúde dos ombros. Trabalha deltoide posterior, romboides e trapézio, corrigindo postura e desequilíbrios.",
    executionSteps:
      "1. Posicione a polia na altura do rosto.\n2. Segure a corda com pegada pronada.\n3. Puxe a corda em direção ao rosto, abrindo os cotovelos para os lados.\n4. No final do movimento, as mãos devem estar ao lado das orelhas.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; puxar para o peito; não abrir os cotovelos; jogar o tronco para trás.",
    tips: "Use carga moderada e foque na contração. Excelente para aquecimento de ombros.",
  },
{
    name: "Agachamento Livre com Barra",
    slug: "agachamento-livre-barra",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Lombar, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Rei dos exercícios para pernas. Trabalha quadríceps, glúteos, posteriores, lombar e core. Essencial para qualquer programa de treino sério.",
    executionSteps:
      "1. Posicione a barra no suporte na altura do peito.\n2. Coloque a barra sobre os trapézios (não no pescoço).\n3. Retire a barra do suporte e dê um passo atrás.\n4. Pés na largura dos ombros, pontas levemente para fora.\n5. Desça flexionando joelhos e quadril até coxas paralelas ao chão.\n6. Suba estendendo joelhos e quadril simultaneamente.\n7. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar a lombar; joelhos para dentro; subir os calcanhares; não atingir paralelo; olhar para baixo.",
    tips: "Mantenha o peito alto e o core firme. Desça como se fosse sentar em uma cadeira.",
  },
{
    name: "Leg Press 45°",
    slug: "leg-press-45",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício de pernas em máquina, mais seguro que o agachamento livre. Excelente para iniciantes e para cargas máximas com segurança.",
    executionSteps:
      "1. Sente-se na máquina com costas apoiadas.\n2. Coloque os pés na plataforma na largura dos ombros.\n3. Solte as travas e flexione os joelhos descendo a plataforma.\n4. Desça até os joelhos formarem 90° (ou um pouco mais).\n5. Empurre a plataforma de volta estendendo as pernas (não tranque os joelhos).\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Descer demais (lombar descola); joelhos para dentro; tranca as pernas no topo; subir os calcanhares.",
    tips: "Pés altos = mais glúteo. Pés baixos = mais quadríceps. Pés juntos = mais vasto lateral.",
  },
{
    name: "Cadeira Extensora",
    slug: "cadeira-extensora",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício de isolamento para quadríceps. Excelente para finalização de treino e para iniciantes. Baixo risco de lesão.",
    executionSteps:
      "1. Sente-se na máquina com as costas apoiadas.\n2. Posicione as canelas sob a almofada.\n3. Segure nas laterais para estabilizar.\n4. Estenda as pernas contraindo os quadríceps.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Jogar o corpo para trás; soltar rapidamente; não contrair no topo; usar impulso.",
    tips: "Segure 1 segundo no topo com pernas estendidas para máxima contração.",
  },
{
    name: "Mesa Flexora",
    slug: "mesa-flexora",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício de isolamento para posteriores de coxa (isquiotibiais). Essencial para equilibrar o desenvolvimento das pernas.",
    executionSteps:
      "1. Deite-se de bruços na máquina.\n2. Posicione os tornozelos sob a almofada.\n3. Flexione os joelhos levando a almofada em direção ao glúteo.\n4. Volte controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Arquear a lombar; soltar rápido; usar impulso; não contrair no final.",
    tips: "Mantenha o quadril firme na máquina. Contraia os posteriores no pico do movimento.",
  },
{
    name: "Cadeira Flexora Sentada",
    slug: "cadeira-flexora-sentada",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação da flexora sentada, trabalha posteriores de coxa com menor envolvimento da lombar. Excelente alternativa à mesa flexora.",
    executionSteps:
      "1. Sente-se na máquina com as costas apoiadas.\n2. Posicione as canelas sobre a almofada.\n3. Flexione os joelhos descendo a almofada.\n4. Volte controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Jogar o corpo para frente; soltar rápido; não contrair; arredondar as costas.",
    tips: "Mantenha o tronco firme. Contraia os posteriores no pico do movimento.",
  },
{
    name: "Stiff com Barra",
    slug: "stiff-barra",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício para posteriores e glúteos com a barra. Diferente do terra, mantém as pernas mais estendidas, focando nos isquiotibiais.",
    executionSteps:
      "1. Segure a barra com pegada pronada na largura dos ombros.\n2. Mantenha as pernas levemente flexionadas (quase estendidas).\n3. Desça a barra rente ao corpo, empurrando o quadril para trás.\n4. Pare quando sentir alongamento nos posteriores.\n5. Suba contraindo glúteos e posteriores.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar a lombar; flexionar muito os joelhos; jogar a barra para frente; não contrair os glúteos.",
    tips: "Mantenha a barra sempre rente às pernas. O movimento vem do quadril, não das costas.",
  },
{
    name: "RDL (Romanian Deadlift)",
    slug: "rdl-romanian-deadlift",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação do levantamento terra focada em posteriores e glúteos. Pernas mais estendidas que o terra convencional.",
    executionSteps:
      "1. Segure a barra com pegada pronada na largura dos ombros.\n2. Mantenha joelhos levemente flexionados (~15°).\n3. Empurre o quadril para trás descendo a barra rente às pernas.\n4. Desça até sentir alongamento nos posteriores.\n5. Suba estendendo o quadril.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar lombar; flexionar muito os joelhos; barra longe do corpo; usar as costas em vez do quadril.",
    tips: "Foque em empurrar o quadril para trás como se fosse fechar uma porta com os glúteos.",
  },
{
    name: "Afundo (Lunge)",
    slug: "afundo-lunge",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Exercício unilateral que trabalha quadríceps, glúteos e posteriores. Excelente para equilíbrio e estabilidade.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo.\n2. Dê um passo largo à frente.\n3. Desça flexionando ambos os joelhos até 90°.\n4. O joelho de trás quase toca o chão.\n5. Empurre de volta à posição inicial.\n6. Alterne as pernas e repita.",
    commonMistakes:
      "Passo curto demais; joelho da frente passa do pé; inclinar o tronco; não descer o suficiente.",
    tips: "Mantenha o tronco ereto. O joelho da frente deve estar alinhado com o tornozelo.",
  },
{
    name: "Panturrilha em Pé",
    slug: "panturrilha-pe",
    muscleGroup: "Panturrilhas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício para panturrilha em pé, foca no gastrocnêmio. Essencial para desenvolvimento completo das pernas.",
    executionSteps:
      "1. Posicione-se na máquina com a almofada sobre os ombros.\n2. Coloque a ponta dos pés na plataforma, calcanhares para fora.\n3. Suba o máximo possível sobre a ponta dos pés.\n4. Desça lentamente até alongar a panturrilha.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; não descer o suficiente; rapidez excessiva; não contrair no topo.",
    tips: "Faça pausa de 1-2 segundos no topo para máxima contração. Alongamento profundo é essencial.",
  },
{
    name: "Panturrilha Sentada",
    slug: "panturrilha-sentada",
    muscleGroup: "Panturrilhas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação de panturrilha sentada, foca no soleus (músculo profundo da panturrilha). Complementa a panturrilha em pé.",
    executionSteps:
      "1. Sente-se na máquina com as almofadas sobre as coxas.\n2. Coloque a ponta dos pés na plataforma.\n3. Empurre a plataforma subindo os calcanhares.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; não alongar; rapidez excessiva; usar carga excessiva.",
    tips: "Maior amplitude de movimento é mais importante que carga. Faça pause no topo.",
  },
{
    name: "Agachamento Búlgaro",
    slug: "agachamento-bulgaro",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Avançado",
    description:
      "Agachamento unilateral com pé traseiro elevado. Exercício intenso que trabalha cada perna individualmente.",
    executionSteps:
      "1. Segure halteres ao lado do corpo.\n2. Posicione um pé à frente e o outro elevado em um banco atrás.\n3. Desça flexionando o joelho da frente.\n4. Vá até o joelho traseiro quase tocar o chão.\n5. Suba empurrando com a perna da frente.\n6. Repita e troque de lado.",
    commonMistakes:
      "Joelho da frente passa do pé; tronco inclinado; pé traseiro muito perto; não descer o suficiente.",
    tips: "Mantenha o tronco ereto. Quanto mais longe o pé da frente, mais glúteo; quanto mais perto, mais quadríceps.",
  },
{
    name: "Hack Machine",
    slug: "hack-machine",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Intermediário",
    description:
      "Agachamento na máquina hack. Foca nos quadríceps com menor stress na lombar que o agachamento livre.",
    executionSteps:
      "1. Posicione-se na máquina com as costas apoiadas e ombros sob as almofadas.\n2. Pés na plataforma na largura dos ombros.\n3. Solte as travas e desça flexionando os joelhos.\n4. Vá até 90° ou mais profundo.\n5. Empurre de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Descer rápido; joelhos para dentro; tirar a lombar do apoio; subir os calcanhares.",
    tips: "Pés baixos e juntos = mais quadríceps. Use cargas moderadas para focar no músculo.",
  },
{
    name: "Agachamento Livre no Smith",
    slug: "agachamento-smith",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Smith",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Intermediário",
    description:
      "Agachamento na máquina Smith. Mais seguro que o livre, permite treinar sem parceiro. Bom para iniciantes e técnica.",
    executionSteps:
      "1. Posicione a barra do Smith sobre os trapézios.\n2. Pés um pouco à frente do corpo.\n3. Solte a barra e desça flexionando joelhos.\n4. Vá até 90° ou mais profundo.\n5. Suba estendendo pernas.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Pés muito à frente (vira panturrilha); joelhos para dentro; não descer o suficiente.",
    tips: "Posicione os pés à frente para proteger joelhos e focar mais em glúteos.",
  },
{
    name: "Cadeira Abdutora",
    slug: "cadeira-abdutora",
    muscleGroup: "Glúteos",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício para glúteo médio e mínimo. Auxilia na estabilidade do quadril e na estética dos glúteos.",
    executionSteps:
      "1. Sente-se na máquina com as pernas nas almofadas.\n2. Empurre as pernas para fora abrindo-as.\n3. Volte controladamente.\n4. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; jogar o corpo para trás; rapidez excessiva; não contrair no final.",
    tips: "Incline o tronco levemente à frente para mais ativação do glúteo médio.",
  },
{
    name: "Cadeira Adutora",
    slug: "cadeira-adutora",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício para adutores (parte interna da coxa). Importante para equilíbrio muscular do quadril.",
    executionSteps:
      "1. Sente-se na máquina com as pernas abertas nas almofadas.\n2. Junte as pernas contraindo a parte interna da coxa.\n3. Volte controladamente.\n4. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; não contrair; rapidez excessiva; jogar o corpo.",
    tips: "Mantenha o tronco firme. Concentre-se na contração da parte interna das coxas.",
  },
{
    name: "Elevação Pélvica (Hip Thrust)",
    slug: "elevacao-pelvica-hip-thrust",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício número 1 para glúteos. Trabalha o glúteo máximo de forma intensa e segura. Essencial para desenvolvimento de glúteos.",
    executionSteps:
      "1. Apoie as costas em um banco, barra sobre o quadril.\n2. Pés apoiados no chão na largura do quadril.\n3. Empurre o quadril para cima contraindo os glúteos.\n4. No topo, o corpo deve formar uma linha reta do joelho ao ombro.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Arquear a lombar no topo; usar as pernas em vez dos glúteos; não subir o suficiente; soltar rápido.",
    tips: "Use uma almofada na barra para conforto. Contraia os glúteos com força no topo.",
  },
{
    name: "Glúteo no Cabo (Coice)",
    slug: "gluteo-cabo-coice",
    muscleGroup: "Glúteos",
    secondaryMuscles: "",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Exercício de isolamento para glúteo máximo. Excelente para finalização do treino de glúteos.",
    executionSteps:
      "1. Posicione a polia na altura baixa com uma alça de tornozelo.\n2. Em pé, apoie-se na máquina com as mãos.\n3. Com a perna na alça, leve-a para trás contraindo o glúteo.\n4. Volte controladamente.\n5. Repita e troque de lado.",
    commonMistakes:
      "Arquear a lombar; usar o movimento das costas; não contrair o glúteo; balançar a perna.",
    tips: "Mantenha o core firme e o movimento isolado no quadril. Pequena pausa no topo.",
  },
{
    name: "Desenvolvimento Militar com Barra",
    slug: "desenvolvimento-militar-barra",
    muscleGroup: "Ombros",
    secondaryMuscles: "Tríceps, Trapézio",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício clássico para ombros. Trabalha deltoide anterior e médio, além de tríceps e trapézio. Excelente para construção de força.",
    executionSteps:
      "1. Em pé, segure a barra na altura do peito com pegada um pouco mais aberta que os ombros.\n2. Mantenha o core firme e coluna neutra.\n3. Empurre a barra para cima até estender os braços.\n4. Desça controladamente até a altura do queixo/peito.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar as costas; jogar a barra para cima; não estender totalmente; usar impulso das pernas.",
    tips: "Use cinto se for carga máxima. Mantenha os glúteos contraídos para estabilizar.",
  },
{
    name: "Desenvolvimento com Halteres",
    slug: "desenvolvimento-halteres",
    muscleGroup: "Ombros",
    secondaryMuscles: "Tríceps, Trapézio",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Desenvolvimento com halteres permite maior amplitude e trabalho unilateral. Excelente para hipertrofia dos ombros.",
    executionSteps:
      "1. Sente-se no banco com encosto (ou em pé) segurando halteres na altura dos ombros.\n2. Mantenha o core firme.\n3. Empurre os halteres para cima até estender os braços.\n4. Desça controladamente até a altura dos ombros.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Arquear a lombar; não descer o suficiente; bater os halteres; usar impulso.",
    tips: "Faça o movimento sentado para proteger a lombar. Use banco com encosto.",
  },
{
    name: "Elevação Lateral com Halteres",
    slug: "elevacao-lateral-halteres",
    muscleGroup: "Ombros",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício de isolamento para deltoide lateral. Essencial para dar largura aos ombros e o famoso 'ombro redondo'.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo com palmas voltadas para dentro.\n2. Cotovelos levemente flexionados.\n3. Suba os halteres para os lados até a altura dos ombros.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; subir acima dos ombros; balançar o corpo; girar os pulsos.",
    tips: "Imagine que está jogando água para os lados. Pequena inclinação do tronco ajuda a isolar.",
  },
{
    name: "Elevação Frontal com Halteres",
    slug: "elevacao-frontal-halteres",
    muscleGroup: "Ombros",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício de isolamento para deltoide anterior. Complementa o desenvolvimento, embora já seja muito recrutado no supino.",
    executionSteps:
      "1. Em pé, segure halteres à frente do corpo com palmas voltadas para baixo.\n2. Suba os halteres à frente até a altura dos ombros.\n3. Desça controladamente.\n4. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; balançar o corpo; subir acima dos ombros; cotovelos muito flexionados.",
    tips: "Use carga moderada e foque no movimento isolado do deltoide anterior.",
  },
{
    name: "Crucifixo Inverso (Peck Reverse)",
    slug: "crucifixo-inverso-peck-reverse",
    muscleGroup: "Ombros",
    secondaryMuscles: "Romboides, Trapézio",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício para deltoide posterior e romboides. Essencial para equilibrar o desenvolvimento dos ombros.",
    executionSteps:
      "1. Sente-se na máquina peck de frente para o encosto (inverso do peck normal).\n2. Segure nas alças com braços estendidos.\n3. Abra os braços para trás contraindo a parte posterior dos ombros.\n4. Volte controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; jogar o corpo; não contrair; rapidez excessiva.",
    tips: "Concentre-se em juntar as escápulas. Use carga moderada para isolamento.",
  },
{
    name: "Encolhimento com Halteres",
    slug: "encolhimento-halteres",
    muscleGroup: "Ombros",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício de isolamento para trapézio superior. Excelente para construção do trapézio e pescoço.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo.\n2. Suba os ombros em direção às orelhas (encolher).\n3. Segure 1 segundo no topo.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Girar os ombros (lesão); usar impulso; não segurar no topo; usar cargas excessivas.",
    tips: "Não gire os ombros - movimento reto para cima e para baixo. Concentre-se na contração.",
  },
{
    name: "Tríceps Pulley",
    slug: "triceps-pulley",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Exercício clássico de isolamento para tríceps. Fácil de executar e ótimo para todas as fases de treinamento.",
    executionSteps:
      "1. Em pé de frente para a polia alta, segure a barra com pegada pronada.\n2. Cotovelos junto ao corpo.\n3. Empurre a barra para baixo até estender os braços.\n4. Volte controladamente até a altura do peito.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Afastar os cotovelos; usar os ombros; jogar o corpo para frente; não estender totalmente.",
    tips: "Mantenha os cotovelos fixos ao corpo. O movimento vem apenas do cotovelo.",
  },
{
    name: "Tríceps Corda",
    slug: "triceps-corda",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação do tríceps na polia usando corda. Permite maior amplitude e contração no final do movimento.",
    executionSteps:
      "1. Em pé de frente para a polia alta, segure a corda.\n2. Cotovelos junto ao corpo.\n3. Empurre a corda para baixo e separe as mãos no final.\n4. Volte controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Não separar as mãos no final; afastar cotovelos; usar impulso; jogar o corpo.",
    tips: "A separação das mãos no final ativa a porção lateral do tríceps. Segure 1 segundo.",
  },
{
    name: "Tríceps Francês",
    slug: "triceps-frances",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Barra W",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício intenso para tríceps com barra W deitado. Excelente para hipertrofia, especialmente da porção longa.",
    executionSteps:
      "1. Deite-se no banco segurando a barra W com pegada fechada.\n2. Braços estendidos sobre o peito.\n3. Flexione os cotovelos descendo a barra em direção à testa.\n4. Estenda os braços voltando à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Afastar os cotovelos; arquear a lombar; usar barra reta (lesão no pulso); jogar a barra na testa.",
    tips: "Use barra W para proteger os pulsos. Mantenha os cotovelos apontados para o teto.",
  },
{
    name: "Tríceps Banco",
    slug: "triceps-banco",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Banco",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício com peso do corpo usando um banco. Excelente para iniciantes e pode ser feito em qualquer lugar.",
    executionSteps:
      "1. Sente-se no banco com mãos apoiadas na borda ao lado do quadril.\n2. Deslize o quadril para frente do banco.\n3. Estenda as pernas à frente (ou flexione para iniciantes).\n4. Desça flexionando os cotovelos até 90°.\n5. Empurre de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Descer rápido; afastar os cotovelos; não descer o suficiente; jogar os ombros.",
    tips: "Mantenha os cotovelos apontados para trás. Para dificultar, eleve os pés em outro banco.",
  },
{
    name: "Mergulho entre Bancos",
    slug: "mergulho-bancos",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Peito, Deltoide Anterior",
    equipment: "Banco",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Variação de mergulho usando dois bancos. Pode adicionar peso sobre as pernas para dificultar.",
    executionSteps:
      "1. Posicione as mãos em um banco atrás de você, pernas estendidas sobre outro banco à frente.\n2. Com pesos sobre as coxas (opcional), desça flexionando os cotovelos.\n3. Vá até 90° de flexão.\n4. Empurre de volta à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Descer rápido; afastar cotovelos; não descer o suficiente; jogar os ombros.",
    tips: "Mantenha os cotovelos para trás. Adicione peso apenas quando dominar a técnica.",
  },
{
    name: "Rosca Direta com Barra",
    slug: "rosca-direta-barra",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Iniciante",
    description:
      "Exercício clássico para bíceps. Permite uso de cargas máximas e trabalha toda a porção do bíceps braquial.",
    executionSteps:
      "1. Em pé, segure a barra com pegada supinada na largura dos ombros.\n2. Cotovelos fixos ao lado do corpo.\n3. Flexione os cotovelos subindo a barra em direção ao peito.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Jogar o corpo para trás; afastar os cotovelos; descer rápido demais; não estender totalmente.",
    tips: "Mantenha os cotovelos fixos. Encoste as costas na parede para evitar impulso.",
  },
{
    name: "Rosca Direta com Halteres",
    slug: "rosca-direta-halteres",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão com halteres da rosca direta. Permite trabalho unilateral e maior amplitude.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo com palmas voltadas para frente.\n2. Cotovelos fixos ao lado do corpo.\n3. Suba os halteres em direção aos ombros.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Jogar o corpo; afastar cotovelos; girar os pulsos; descer rápido.",
    tips: "Mantenha os pulsos retos e firmes. Varie alternando os braços para mais foco.",
  },
{
    name: "Rosca Alternada",
    slug: "rosca-alternada",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Rosca alternando os braços com supinação. Excelente para concentração e correção de assimetrias.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo com palmas voltadas para dentro.\n2. Suba um halter girando o pulso (supinação) durante o movimento.\n3. Contraia no topo e desça.\n4. Repita com o outro braço.\n5. Alterne até completar as repetições.",
    commonMistakes:
      "Jogar o corpo; não supinar; afastar cotovelos; rapidez excessiva.",
    tips: "A supinação ativa mais o bíceps. Faça o movimento lentamente e com controle.",
  },
{
    name: "Rosca Martelo",
    slug: "rosca-martelo",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Braquiorradial",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Variação de rosca com pegada neutra. Trabalha braquiorradial e dá espessura ao braço.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo com palmas voltadas uma para a outra.\n2. Cotovelos fixos.\n3. Suba os halteres mantendo a pegada neutra.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Jogar o corpo; afastar cotovelos; girar os pulsos; descer rápido.",
    tips: "Mantenha os pulsos firmes em pegada neutra. Pode ser feito alternado ou simultâneo.",
  },
{
    name: "Rosca Scott",
    slug: "rosca-scott",
    muscleGroup: "Bíceps",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Rosca no banco Scott isolando totalmente o bíceps. Impede o uso de impulso, excelente para técnica e hipertrofia.",
    executionSteps:
      "1. Sente-se no banco Scott com os braços apoiados na almofada.\n2. Segure a barra ou halteres com pegada supinada.\n3. Flexione os cotovelos subindo o peso.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Soltar rápido; não estender totalmente; jogar o corpo; usar peso excessivo.",
    tips: "Use carga moderada e foque no movimento controlado. Excelente para finalização.",
  },
{
    name: "Rosca Concentrada",
    slug: "rosca-concentrada",
    muscleGroup: "Bíceps",
    secondaryMuscles: "",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício de isolamento intenso com halter. Excelente para pico do bíceps e conexão mente-músculo.",
    executionSteps:
      "1. Sente-se no banco com pernas abertas.\n2. Apoie o cotovelo na parte interna da coxa.\n3. Segure o halter com pegada supinada.\n4. Flexione o cotovelo subindo o halter.\n5. Desça controladamente.\n6. Repita e troque de lado.",
    commonMistakes:
      "Jogar o braço; usar impulso do corpo; não apoiar o cotovelo; rapidez excessiva.",
    tips: "Use carga moderada e foque na contração. Excelente para finalização do treino.",
  },
{
    name: "Prancha (Plank)",
    slug: "prancha-plank",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Core, Lombar",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício isométrico para core. Trabalha toda a musculatura estabilizadora do tronco. Essencial para saúde e performance.",
    executionSteps:
      "1. Apoie os antebraços no chão, cotovelos sob os ombros.\n2. Estenda as pernas, sustentando o corpo na ponta dos pés.\n3. Mantenha o corpo reto da cabeça aos calcanhares.\n4. Contraia o abdômen e glúteos.\n5. Segure pelo tempo determinado.",
    commonMistakes:
      "Subir o quadril; deixar cair o quadril; arquear a lombar; esquecer de respirar.",
    tips: "Mantenha o core firme e respire normalmente. Comece com 30 segundos e aumente gradualmente.",
  },
{
    name: "Abdominal Supra",
    slug: "abdominal-supra",
    muscleGroup: "Abdômen",
    secondaryMuscles: "",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício clássico para reto abdominal. Trabalha principalmente a porção superior do abdômen.",
    executionSteps:
      "1. Deite-se de costas com joelhos flexionados e pés no chão.\n2. Mãos atrás da cabeça ou cruzadas no peito.\n3. Contraia o abdômen subindo o tronco.\n4. Suba até descolar as escápulas do chão.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Puxar a cabeça com as mãos; usar impulso; não contrair o abdômen; subir totalmente.",
    tips: "Mantenha o queixo afastado do peito. Foque em contrair o abdômen, não em subir alto.",
  },
{
    name: "Infra na Banca",
    slug: "infra-banca",
    muscleGroup: "Abdômen",
    secondaryMuscles: "",
    equipment: "Banca",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício para porção inferior do abdômen usando banca inclinada. Excelente complemento ao abdominal supra.",
    executionSteps:
      "1. Deite-se em uma banca inclinada com a cabeça para baixo.\n2. Segure nas almofadas ou bordas.\n3. Flexione o quadril subindo as pernas.\n4. Suba até o quadril descolar da banca.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; jogar as pernas; arquear a lombar; rapidez excessiva.",
    tips: "Mantenha as pernas levemente flexionadas. Foque na contração do abdômen inferior.",
  },
{
    name: "Prancha Lateral",
    slug: "prancha-lateral",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Oblíquos, Core",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Variação lateral da prancha. Trabalha oblíquos e core de forma isométrica. Essencial para estabilidade do tronco.",
    executionSteps:
      "1. Deite-se de lado, apoiando o antebraço no chão.\n2. Cotovelo sob o ombro.\n3. Eleve o quadril sustentando o corpo na ponta do pé e no antebraço.\n4. Mantenha o corpo reto.\n5. Segure pelo tempo determinado e troque de lado.",
    commonMistakes:
      "Deixar o quadril cair; rodar o corpo; não alinhar; esquecer de respirar.",
    tips: "Mantenha o quadril elevado e alinhado. Comece com 20 segundos e aumente gradualmente.",
  },
{
    name: "Abdominal Bicicleta",
    slug: "abdominal-bicicleta",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Oblíquos",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício dinâmico que trabalha reto abdominal e oblíquos simultaneamente. Excelente para core completo.",
    executionSteps:
      "1. Deite-se de costas com mãos atrás da cabeça.\n2. Eleve as pernas com joelhos flexionados.\n3. Leve o cotovelo direito ao joelho esquerdo enquanto estende a perna direita.\n4. Alterne o lado como se estivesse pedalando.\n5. Continue alternando pelo número de repetições.",
    commonMistakes:
      "Puxar a cabeça; rapidez excessiva; não contrair; usar impulso.",
    tips: "Faça o movimento de forma controlada. Concentre-se na contração dos oblíquos.",
  },
{
    name: "Hanging Leg Raise",
    slug: "hanging-leg-raise",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Core, Quadríceps",
    equipment: "Barra fixa",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Exercício avançado para abdômen inferior suspenso na barra fixa. Excelente para força e hipertrofia do abdômen.",
    executionSteps:
      "1. Pendure na barra fixa com pegada pronada.\n2. Mantenha as pernas estendidas.\n3. Suba as pernas até a altura do quadril (ou mais alto).\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Balançar o corpo; usar impulso; descer rápido; arquear a lombar.",
    tips: "Para iniciantes, faça com joelhos flexionados. Mantenha o core firme para evitar balanço.",
  },
{
    name: "Encolhimento com Barra",
    slug: "encolhimento-barra",
    muscleGroup: "Trapézio",
    secondaryMuscles: "",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Iniciante",
    description:
      "Exercício para trapézio superior com barra. Permite cargas máximas para hipertrofia do trapézio.",
    executionSteps:
      "1. Em pé, segure a barra com pegada pronada na largura dos ombros.\n2. Mantenha os braços estendidos.\n3. Suba os ombros em direção às orelhas.\n4. Segure 1 segundo no topo.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Girar os ombros (lesão); usar impulso; não segurar no topo; cargas excessivas.",
    tips: "Movimento reto para cima e para baixo. Não gire os ombros para evitar lesões.",
  },
{
    name: "Remada Alta com Barra",
    slug: "remada-alta-barra",
    muscleGroup: "Trapézio",
    secondaryMuscles: "Deltoide Lateral",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício composto para trapézio e deltoide lateral. Excelente para desenvolvimento do trapézio superior e médio.",
    executionSteps:
      "1. Em pé, segure a barra com pegada fechada na largura dos ombros.\n2. Puxe a barra em direção ao queixo, cotovelos para cima e para os lados.\n3. Na altura máxima, cotovelos devem estar acima dos pulsos.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Usar impulso; subir acima do queixo; jogar o corpo; pegada muito aberta.",
    tips: "Use pegada na largura dos ombros. Não suba acima do queixo para proteger os ombros.",
  },
{
    name: "Punho com Barra",
    slug: "punho-barra",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Iniciante",
    description:
      "Exercício de isolamento para antebraço. Trabalha flexores do punho. Importante para força de pegada.",
    executionSteps:
      "1. Sente-se em um banco, antebraços apoiados nas coxas.\n2. Segure a barra com pegada supinada.\n3. Mãos para fora das coxas, deixando os pulsos livres para mover.\n4. Flexione os pulsos subindo a barra.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Levantar o antebraço; usar impulso; rapidez excessiva; não contrair.",
    tips: "Use carga moderada e faça o movimento completo. Excelente para força de pegada.",
  },
{
    name: "Punho Invertido",
    slug: "punho-invertido",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Iniciante",
    description:
      "Variação do punho com pegada pronada. Trabalha extensores do punho. Complementa o trabalho de antebraço.",
    executionSteps:
      "1. Sente-se em um banco, antebraços apoiados nas coxas.\n2. Segure a barra com pegada pronada.\n3. Mãos para fora das coxas.\n4. Estenda os pulsos subindo a barra.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Levantar o antebraço; usar impulso; rapidez excessiva; não contrair.",
    tips: "Use carga leve. Os extensores são mais fracos que os flexores.",
  },
{
    name: "Hip Thrust com Barra",
    slug: "hip-thrust-barra",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Versão avançada do hip thrust com barra. Considerado o melhor exercício para ativação do glúteo máximo.",
    executionSteps:
      "1. Apoie as costas em um banco, barra sobre o quadril (com almofada).\n2. Pés apoiados no chão, joelhos flexionados a 90°.\n3. Empurre o quadril para cima contraindo os glúteos.\n4. No topo, corpo forma linha reta do joelho ao ombro.\n5. Desça controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Arquear a lombar no topo; usar as pernas em vez dos glúteos; não subir o suficiente; soltar rápido.",
    tips: "Use almofada na barra. Contraia os glúteos com força no topo por 1-2 segundos.",
  },
{
    name: "Agachamento Goblet",
    slug: "agachamento-goblet",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Agachamento com halter na altura do peito. Excelente para iniciantes aprenderem a técnica do agachamento.",
    executionSteps:
      "1. Em pé, segure um halter na altura do peito com ambas as mãos.\n2. Pés na largura dos ombros, pontas levemente para fora.\n3. Desça flexionando joelhos e quadril.\n4. Vá até os cotovelos tocarem os joelhos.\n5. Suba estendendo as pernas.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Joelhos para dentro; arredondar as costas; não descer o suficiente; inclinar para frente.",
    tips: "Mantenha o halter próximo ao peito e o tronco ereto. Excelente para aprender técnica.",
  },
{
    name: "Stiff com Halteres",
    slug: "stiff-halteres",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão do stiff com halteres. Excelente para posteriores e glúteos com menor carga.",
    executionSteps:
      "1. Em pé, segure halteres ao lado do corpo.\n2. Pernas levemente flexionadas.\n3. Empurre o quadril para trás descendo os halteres rente às pernas.\n4. Desça até sentir alongamento nos posteriores.\n5. Suba estendendo o quadril.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar a lombar; flexionar muito os joelhos; afastar os halteres; usar as costas.",
    tips: "Mantenha os halteres rente às pernas. O movimento vem do quadril.",
  },
{
    name: "Avanço (Step-up)",
    slug: "avanco-step-up",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Exercício unilateral subindo em um banco. Excelente para glúteos e quadríceps com componente funcional.",
    executionSteps:
      "1. Segure halteres ao lado do corpo.\n2. Coloque um pé sobre um banco/caixa à frente.\n3. Suba empurrando com o pé no banco.\n4. No topo, fique em pé sobre o banco.\n5. Desça controladamente.\n6. Repita e troque de lado.",
    commonMistakes:
      "Usar impulso do pé de trás; descer rápido; joelho para dentro; não subir totalmente.",
    tips: "Use altura de banco que permita joelho a 90° no início. Foque em usar a perna do banco.",
  },
{
    name: "Sumo Squat com Halter",
    slug: "sumo-squat-halter",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Adutores",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Agachamento com pegada sumo (pés mais abertos). Foca mais em glúteos e adutores que o agachamento tradicional.",
    executionSteps:
      "1. Em pé com pés bem abertos, pontas dos pés para fora.\n2. Segure um halter com as duas mãos entre as pernas.\n3. Desça flexionando joelhos e quadril.\n4. Vá até o halter quase tocar o chão.\n5. Suba estendendo as pernas.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Joelhos para dentro; não descer o suficiente; inclinar o tronco; pontas dos pés para frente.",
    tips: "Mantenha o tronco ereto e joelhos alinhados com as pontas dos pés.",
  },
{
    name: "Good Morning",
    slug: "good-morning",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Exercício para posteriores, glúteos e lombar com barra. Excelente para fortalecer a cadeia posterior.",
    executionSteps:
      "1. Em pé, barra sobre os trapézios como no agachamento.\n2. Pés na largura dos ombros.\n3. Incline o tronco à frente empurrando o quadril para trás.\n4. Mantenha as pernas quase estendidas.\n5. Desça até ficar paralelo ao chão.\n6. Suba estendendo o quadril.\n7. Repita pelo número de repetições.",
    commonMistakes:
      "Arredondar a lombar; flexionar muito os joelhos; usar carga excessiva; jogar o corpo.",
    tips: "Comece com carga leve para dominar a técnica. Mantenha a coluna neutra.",
  },
{
    name: "Cadeira Adutora no Cabo",
    slug: "cadeira-adutora-cabo",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Polia",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Exercício para adutores usando polia. Variação da cadeira adutora com cabo, oferecendo tensão constante.",
    executionSteps:
      "1. Em pé ao lado da polia baixa, alça no tornozelo.\n2. Com a perna na alça, leve-a para frente cruzando o corpo.\n3. Volte controladamente.\n4. Repita e troque de lado.",
    commonMistakes:
      "Usar impulso; jogar o corpo; não contrair; rapidez excessiva.",
    tips: "Use carga moderada. Foque na contração da parte interna da coxa.",
  },
{
    name: "Wall Ball (Remada Face Pull com Kettlebell)",
    slug: "remada-kettlebell",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Trapézio",
    equipment: "Kettlebell",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Remada com kettlebell em posição de prancha. Trabalha costas, core e estabilizadores.",
    executionSteps:
      "1. Em posição de prancha alta, segure um kettlebell com uma mão.\n2. Puxe o kettlebell em direção ao quadril.\n3. Volte controladamente.\n4. Repita e troque de lado.",
    commonMistakes:
      "Girar o tronco; balançar o corpo; não contrair; usar impulso.",
    tips: "Mantenha o core firme e o quadril estável. Use carga moderada.",
  },
{
    name: "Kettlebell Swing",
    slug: "kettlebell-swing",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores, Core, Lombar",
    equipment: "Kettlebell",
    category: "Força",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício dinâmico com kettlebell. Trabalha glúteos, posteriores e core de forma explosiva.",
    executionSteps:
      "1. Em pé, segure o kettlebell com as duas mãos.\n2. Pés na largura dos ombros.\n3. Balance o kettlebell entre as pernas flexionando levemente os joelhos.\n4. Impulse o quadril para frente jogando o kettlebell à frente.\n5. Deixe o kettlebell voltar entre as pernas.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar os braços; arredondar a lombar; não usar o quadril; carga excessiva.",
    tips: "O movimento vem do quadril, não dos braços. Mantenha o core firme e coluna neutra.",
  },
{
    name: "Supino Declinado com Barra",
    slug: "supino-declinado-barra",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação do supino no banco declinado que foca na porção inferior do peitoral. Permite usar mais carga que o supino reto por envolver menos ombros.",
    executionSteps:
      "1. Deite-se no banco declinado com os pés presos.\n2. Segure a barra com pegada um pouco mais aberta que os ombros.\n3. Retire a barra do suporte e posicione sobre a porção inferior do peito.\n4. Desça controladamente até tocar o peito abaixo dos mamilos.\n5. Empurre de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Quicar a barra no peito; soltar a barra; não usar os pés como apoio; cotovelos muito abertos.",
    tips: "Use um banco com ângulo de 15 a 30 graus de declínio. Sempre peça ajuda ao segurar/liberar a barra.",
  },
{
    name: "Crucifixo Inclinado com Halteres",
    slug: "crucifixo-inclinado-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do crucifixo no banco inclinado que foca na porção superior do peitoral. Excelente para complementar o supino inclinado.",
    executionSteps:
      "1. Ajuste o banco em inclinação de 30 a 45 graus.\n2. Deite-se com os halteres acima do peito superior, braços estendidos.\n3. Com cotovelos levemente flexionados, desça os halteres em arco amplo.\n4. Sinta o alongamento do peito superior.\n5. Suba os halteres de volta em movimento de abraço.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; transformar em supino (flexionar cotovelos demais); descer rápido.",
    tips: "Use carga moderada. Foque no alongamento e contração do peito superior.",
  },
{
    name: "Peck Deck (Máquina)",
    slug: "peck-deck",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Máquina de isolamento para o peitoral. Movimento guiado que simula o crucifixo, ideal para finalizar o treino de peito.",
    executionSteps:
      "1. Sente-se na máquina com as costas apoiadas.\n2. Posicione os antebraços nas almofadas laterais.\n3. Cotovelos na altura dos ombros.\n4. Junte as almofadas à frente do peito contraindo o peitoral.\n5. Volte controladamente até sentir alongamento.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; jogar o tronco; não controlar a volta; cotovelos muito baixos.",
    tips: "Use como finalizador. Foque na contração e no squeeze no meio do movimento.",
  },
{
    name: "Elevação Lateral na Polia",
    slug: "elevacao-lateral-polia",
    muscleGroup: "Ombros",
    secondaryMuscles: "Trapézio",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Variação da elevação lateral usando polia. Mantém tensão constante durante todo o movimento, diferente dos halteres.",
    executionSteps:
      "1. Posicione a polia na altura mais baixa.\n2. Segure o cabo com uma mão, de lado para a polia.\n3. Com cotovelo levemente flexionado, eleve o cabo até a altura do ombro.\n4. Volte controladamente até a posição inicial.\n5. Repita pelo número de repetições e troque de lado.",
    commonMistakes:
      "Elevar acima do ombro; usar trapézio (encolher); balançar o corpo; usar muito peso.",
    tips: "Mantenha o core firme e o corpo estável. A tensão constante da polia é o grande diferencial.",
  },
{
    name: "Desenvolvimento Arnold",
    slug: "desenvolvimento-arnold",
    muscleGroup: "Ombros",
    secondaryMuscles: "Tríceps, Trapézio",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Avançado",
    description:
      "Variação do desenvolvimento popularizada por Arnold Schwarzenegger. Trabalha todas as porções do deltoide através da rotação das mãos.",
    executionSteps:
      "1. Sente-se no banco com encosto, halteres nas mãos.\n2. Comece com palmas voltadas para você, cotovelos na altura dos ombros.\n3. Conforme sobe, gire as palmas para frente.\n4. Estenda os braços no topo.\n5. Volte girando as palmas de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; não fazer a rotação completa; arquear a lombar; pressa no movimento.",
    tips: "Use carga moderada. A rotação é o que torna o exercício único - não pule essa parte.",
  },
{
    name: "Remada Unilateral com Halter",
    slug: "remada-unilateral-halter",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Trapézio",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Remada unilateral com halter apoiada no banco. Permite isolar cada lado das costas e usar carga considerável com segurança.",
    executionSteps:
      "1. Apoie um joelho e uma mão no banco.\n2. Costas retas, tronco paralelo ao chão.\n3. Segure o halter com a mão livre, braço estendido.\n4. Puxe o halter em direção ao quadril, contraindo as costas.\n5. Volte controladamente até estender o braço.\n6. Repita e troque de lado.",
    commonMistakes:
      "Girar o tronco; puxar com o bíceps; não contrair as costas; usar impulso.",
    tips: "Imagine puxar o halter com o cotovelo, não com a mão. Isso ativa mais as costas.",
  },
{
    name: "Pulldown com Pulley",
    slug: "pulldown-pulley",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação da puxada frontal com pegada mais fechada. Foca mais na porção central das costas (dorsal médio e romboides).",
    executionSteps:
      "1. Sente-se na máquina de puxada com a pegada fechada.\n2. Tronco levemente inclinado para trás.\n3. Puxe a pegada em direção ao peito, contraindo as costas.\n4. Volte controladamente até estender os braços.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Balançar o corpo; puxar com os braços; não contrair; usar muito peso.",
    tips: "Sinta as costas trabalhando. Jogue o peito fora ao puxar para melhor contração.",
  },
{
    name: "Levantamento Terra Sumô",
    slug: "levantamento-terra-sumo",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Posteriores, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Variação do levantamento terra com pegada sumô (pés mais abertos). Foca mais em adutores e quadríceps do que o terra convencional.",
    executionSteps:
      "1. Pés bem abertos, ponta dos pés para fora.\n2. Agache e segure a barra no meio das pernas, braços estendidos.\n3. Costas retas, peito erguido.\n4. Levante estendendo pernas e quadril simultaneamente.\n5. Mantenha a barra perto do corpo.\n6. Volte controladamente e repita.",
    commonMistakes:
      "Arredondar a lombar; joelhos para dentro; barra longe do corpo; falta de mobilidade.",
    tips: "Excelente para quem tem pouca mobilidade no terra convencional. Use calçados baixos.",
  },
{
    name: "Agachamento Frontal",
    slug: "agachamento-frontal",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Variação do agachamento com a barra na frente (apoiada nos ombros). Foca mais em quadríceps e core, exigindo postura mais ereta.",
    executionSteps:
      "1. Posicione a barra na frente, apoiada nos ombros/deltoides.\n2. Cotovelos altos, braços cruzados ou pegada clean.\n3. Pés na largura dos ombros.\n4. Agache mantendo o tronco ereto.\n5. Desça até paralelo ou abaixo.\n6. Suba estendendo pernas e quadril.",
    commonMistakes:
      "Cotovelos caídos; inclinar o tronco para frente; joelhos para dentro; descer rápido.",
    tips: "Mantenha os cotovelos altos durante todo o movimento. Core firme é essencial.",
  },
{
    name: "Cadeira Extensora Unilateral",
    slug: "cadeira-extensora-unilateral",
    muscleGroup: "Pernas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação unilateral da cadeira extensora. Excelente para corrigir assimetrias e focar em cada perna individualmente.",
    executionSteps:
      "1. Sente-se na cadeira extensora.\n2. Use apenas uma perna por vez.\n3. Estenda a perna contraindo o quadríceps.\n4. Segure 1 segundo no topo.\n5. Volte controladamente.\n6. Repita e troque de perna.",
    commonMistakes:
      "Quicar no topo; usar impulso; não contrair; descer rápido demais.",
    tips: "Use carga menor do que bilateral. Foque na contração e no squeeze.",
  },
{
    name: "Leg Press 90° (Vertical)",
    slug: "leg-press-90",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Intermediário",
    description:
      "Variação vertical do leg press. Permite usar mais carga com segurança e trabalha fortemente quadríceps e glúteos.",
    executionSteps:
      "1. Sente-se na máquina com as costas apoiadas.\n2. Pés na plataforma, na largura dos ombros.\n3. Destrave a máquina.\n4. Flexione os joelhos descendo a plataforma.\n5. Empurre de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Colar os joelhos no peito; empurrar com as costas; não controlar a descida; joelhos para dentro.",
    tips: "Não destrave totalmente os joelhos no topo. Mantenha tensão constante.",
  },
{
    name: "Panturrilha no Leg Press",
    slug: "panturrilha-leg-press",
    muscleGroup: "Panturrilhas",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício de panturrilha feito no leg press 45. Permite usar carga considerável com segurança para a lombar.",
    executionSteps:
      "1. Sente-se no leg press 45°.\n2. Pés na borda inferior da plataforma, apenas antepés apoiados.\n3. Destrave a máquina.\n4. Flexione os tornozelos descendo a plataforma.\n5. Empurre com as panturrilhas voltando à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Usar muito peso; não fazer amplitude completa; joelhos travados; quicar.",
    tips: "Faça amplitude completa. Segure 1 segundo no topo para melhor contração.",
  },
{
    name: "Elevação Pélvica Unilateral",
    slug: "elevacao-pelvica-unilateral",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores, Core",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Variação unilateral do hip thrust. Trabalha cada glúteo separadamente, sendo excelente para correção de assimetrias.",
    executionSteps:
      "1. Deite-se de costas, joelhos flexionados.\n2. Levante uma perna estendida.\n3. Eleve o quadril contraindo o glúteo de apoio.\n4. Segure 1 segundo no topo.\n5. Volte controladamente.\n6. Repita e troque de perna.",
    commonMistakes:
      "Arquear a lombar; não contrair o glúteo; usar os posteriores demais; subir rápido.",
    tips: "Use a mão no glúteo para sentir a contração. Carga adicional opcional no quadril.",
  },
{
    name: "Coice de Glúteo no Solo",
    slug: "coice-gluteo-solo",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Core",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício de glúteo no solo, em posição quadrúpede. Excelente para ativação e finalização do treino de glúteos.",
    executionSteps:
      "1. Em posição quadrúpede, mãos e joelhos no chão.\n2. Levante uma perna flexionada em 90 graus.\n3. Empurre o pé para cima contraindo o glúteo.\n4. Volte controladamente.\n5. Repita pelo número de repetições.\n6. Troque de perna.",
    commonMistakes:
      "Arquear a lombar; girar o quadril; usar impulso; não contrair o glúteo.",
    tips: "Adicione caneleira para dificultar. Foque na contração no topo do movimento.",
  },
{
    name: "Tríceps Testa com Halteres",
    slug: "triceps-testa-halteres",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do tríceps testa com halteres. Permite maior amplitude e trabalho unilateral, sendo ótimo para hipertrofia.",
    executionSteps:
      "1. Deite-se no banco reto com halteres nas mãos.\n2. Braços estendidos sobre o peito.\n3. Flexione os cotovelos descendo os halteres até a testa.\n4. Mantenha cotovelos apontados para o teto.\n5. Estenda os braços de volta à posição inicial.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Abrir os cotovelos; deixar os halteres caírem longe da testa; arquear lombar.",
    tips: "Use carga moderada. Cotovelos fixos apontados para o teto durante todo o movimento.",
  },
{
    name: "Tríceps Coice",
    slug: "triceps-coice",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Variação de tríceps na polia alta com pegada reversa (palmas para cima). Foca mais na porção medial do tríceps.",
    executionSteps:
      "1. Posicione a polia na altura mais alta.\n2. Segure a barra com pegada supinada (palmas para cima).\n3. Cotovelos fixos ao lado do corpo.\n4. Empurre a barra para baixo até estender os braços.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Mover os cotovelos; usar os ombros; balançar o corpo; usar muito peso.",
    tips: "Pegada supinada é mais fraca que pronada - use menos carga. Foque na contração.",
  },
{
    name: "Rosca 21",
    slug: "rosca-21",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Técnica avançada de rosca direta que divide o movimento em 3 partes de 7 repetições: metade inferior, metade superior e completa. Excelente para hipertrofia.",
    executionSteps:
      "1. Segure a barra com pegada supinada, de pé.\n2. Faça 7 repetições da metade inferior (até a metade do movimento).\n3. Faça 7 repetições da metade superior (da metade ao topo).\n4. Faça 7 repetições completas.\n5. Isso completa 1 série. Descanse e repita.",
    commonMistakes:
      "Usar impulso; não respeitar as metades; balançar o corpo; usar muito peso.",
    tips: "Use carga menor que a rosca direta normal. O burn vai ser intenso - aguenta!",
  },
{
    name: "Rosca Direta na Polia",
    slug: "rosca-direta-polia",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Rosca direta usando polia baixa. Mantém tensão constante nos bíceps durante todo o movimento, sendo excelente para hipertrofia.",
    executionSteps:
      "1. Posicione a polia na altura mais baixa.\n2. Segure a barra com pegada supinada.\n3. Cotovelos fixos ao lado do corpo.\n4. Flexione os cotovelos subindo a barra até o peito.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Mover os cotovelos para frente; balançar o corpo; usar impulso; descer rápido.",
    tips: "A tensão constante da polia é o grande diferencial. Foque na contração no topo.",
  },
{
    name: "Rosca Punho na Polia",
    slug: "rosca-punho-polia",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Exercício de antebraço na polia. Trabalha os flexores do punho com tensão constante, complementando o treino de braços.",
    executionSteps:
      "1. Posicione a polia na altura mais baixa.\n2. Segure a barra com pegada supinada.\n3. Apoie os antebraços nas coxas.\n4. Flexione os pulsos subindo a barra.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Levantar os antebraços; usar muito peso; não fazer amplitude completa; pressa.",
    tips: "Use carga leve. O movimento é pequeno - foque na contração dos flexores.",
  },
{
    name: "Abdominal na Polia (Crunch)",
    slug: "abdominal-polia",
    muscleGroup: "Abdômen",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Abdominal na polia alta com corda. Permite usar carga e trabalhar a hipertrofia do reto abdominal, sendo mais eficaz que o abdominal no solo.",
    executionSteps:
      "1. Posicione a polia na altura mais alta com corda.\n2. Ajoelhe-se de costas para a máquina.\n3. Segure a corda ao lado da cabeça.\n4. Faça um crunch contraindo o abdômen.\n5. Leve os cotovelos em direção aos joelhos.\n6. Volte controladamente e repita.",
    commonMistakes:
      "Usar os braços; balançar o corpo; não contrair o abdômen; usar quadril.",
    tips: "Use carga moderada. O movimento é pequeno, foque na contração do abdômen.",
  },
{
    name: "Abdominal Infra na Barra",
    slug: "abdominal-infra-barra",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Posteriores, Flexores do Quadril",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Infra na barra fixa, elevando as pernas até a barra. É um dos exercícios mais avançados para abdômen, exigindo muita força e controle.",
    executionSteps:
      "1. Pendure na barra fixa com pegada aberta.\n2. Mantenha as pernas estendidas.\n3. Eleve as pernas até tocarem a barra.\n4. Mantenha o core firme e controlado.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Balançar o corpo; usar impulso; flexionar joelhos; não fazer amplitude completa.",
    tips: "Se for muito difícil, comece elevando até 90 graus. Evite balançar usando o core.",
  },
{
    name: "Hollow Body (Corpo Oco)",
    slug: "hollow-body",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Posteriores",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Exercício isométrico de core, base da ginástica. Trabalha todo o abdômen em posição de 'corpo oco', sendo excelente para força funcional.",
    executionSteps:
      "1. Deite-se de costas no chão.\n2. Eleve pernas e tronco levemente do chão.\n3. Mantenha a lombar colada ao chão.\n4. Braços estendidos atrás da cabeça.\n5. Segure a posição por 20-60 segundos.\n6. Repita pelo número de séries.",
    commonMistakes:
      "Arquear a lombar; elevar demais as pernas; não contrair o abdômen; soltar o core.",
    tips: "Se a lombar descolar do chão, eleve mais as pernas. Foque na contração.",
  },
{
    name: "Russian Twist",
    slug: "russian-twist",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Obliquos",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício de rotação de tronco que trabalha os oblíquos. Pode ser feito com peso adicional (disco, halter, bola).",
    executionSteps:
      "1. Sente-se no chão com joelhos flexionados.\n2. Incline o tronco levemente para trás.\n3. Eleve os pés do chão (opcional).\n4. Gire o tronco levando as mãos de um lado ao outro.\n5. Toque o chão de cada lado.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Mover apenas os braços; arquear a lombar; usar muito peso; pressa no movimento.",
    tips: "Use peso adicional para dificultar. Movimento controlado, foque nos oblíquos.",
  },
{
    name: "Remada Cavalinho (T-Bar)",
    slug: "remada-t-bar",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Trapézio",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Remada na barra T (cavalinho). Permite usar carga considerável com pegada neutra, sendo excelente para espessura das costas.",
    executionSteps:
      "1. Posicione-se sobre a barra T com os pés firmes.\n2. Segure o pegador com pegada neutra.\n3. Tronco inclinado a 45 graus, costas retas.\n4. Puxe o pegador em direção ao peito.\n5. Contraia as costas no topo.\n6. Volte controladamente e repita.",
    commonMistakes:
      "Arredondar a lombar; usar impulso; não contrair; balançar o corpo.",
    tips: "Use cinto de halterofilismo para cargas elevadas. Foque na contração no topo.",
  },
{
    name: "Levantamento Terra Romeno com Barra",
    slug: "terra-romeno-barra",
    muscleGroup: "Posteriores",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação do levantamento terra focado em posteriores e glúteos. Movimento mais lento e controlado que o terra convencional.",
    executionSteps:
      "1. Em pé, segure a barra com pegada pronada.\n2. Pés na largura do quadril.\n3. Empurre o quadril para trás, descendo a barra pelas pernas.\n4. Mantenha pernas levemente flexionadas.\n5. Desça até sentir alongamento dos posteriores.\n6. Volta contraindo glúteos e posteriores.",
    commonMistakes:
      "Arredondar a lombar; flexionar demais os joelhos; barra longe do corpo; usar impulso.",
    tips: "A barra deve descer rente às pernas. Foque no alongamento dos posteriores.",
  },
{
    name: "Cadeira Flexora Deitada",
    slug: "cadeira-flexora-deitada",
    muscleGroup: "Posteriores",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação da cadeira flexora deitado. Trabalha os posteriores com maior alongamento inicial, sendo eficaz para hipertrofia.",
    executionSteps:
      "1. Ajuste a máquina e deite-se de bruços.\n2. Posicione os tornozelos sob a almofada.\n3. Flexione os joelhos subindo a almofada.\n4. Contraia os posteriores no topo.\n5. Volte controladamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Quicar; usar impulso; levantar o quadril; não contrair; descer rápido.",
    tips: "Mantenha o quadril colado no banco. Faça pausa de 1 segundo no topo.",
  },
{
    name: "Good Morning com Halteres",
    slug: "good-morning-halteres",
    muscleGroup: "Posteriores",
    secondaryMuscles: "Glúteos, Lombar",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do good morning com halteres. Mais seguro que a barra para iniciantes, trabalhando posteriores, glúteos e lombar.",
    executionSteps:
      "1. Segure um halter em cada mão na altura do peito.\n2. Em pé, pés na largura dos ombros.\n3. Empurre o quadril para trás, descendo o tronco.\n4. Mantenha as costas retas.\n5. Desça até ficar paralelo ao chão.\n6. Volte contraindo glúteos e posteriores.",
    commonMistakes:
      "Arredondar a lombar; flexionar demais os joelhos; usar muito peso; descer rápido.",
    tips: "Use carga moderada. Foque em manter as costas retas durante todo o movimento.",
  },
{
    name: "Agachamento Pulsatório",
    slug: "agachamento-pulsatorio",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Agachamento isométrico com pequenas pulsações. Mantém tensão constante nos quadríceps e glúteos, sendo ótimo finalizador.",
    executionSteps:
      "1. Em pé, pés na largura dos ombros.\n2. Agache até paralelo.\n3. Faça pequenas pulsações subindo e descendo alguns centímetros.\n4. Mantenha o tronco ereto.\n5. Continue por 30-60 segundos.\n6. Repita pelo número de séries.",
    commonMistakes:
      "Subir demais; joelhos para dentro; inclinar o tronco; não contrair.",
    tips: "Use como finalizador. O burn vai ser intenso - mantenha a posição.",
  },
{
    name: "Jump Squat (Agachamento com Salto)",
    slug: "jump-squat",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Panturrilhas",
    equipment: "Peso do corpo",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Exercício pliométrico que trabalha potência e explosão. Excelente para atletas e para cardio de alta intensidade.",
    executionSteps:
      "1. Em pé, pés na largura dos ombros.\n2. Agache até paralelo.\n3. Exploda para cima saltando o mais alto possível.\n4. Aterre suavemente flexionando os joelhos.\n5. Imediatamente agache novamente.\n6. Repita pelo número de repetições.",
    commonMistakes:
      "Aterrissar duro; joelhos para dentro; não amortecer; usar amplitude curta.",
    tips: "Use tênis adequado. Aterre suavemente para proteger joelhos e coluna.",
  },
{
    name: "Burpee",
    slug: "burpee",
    muscleGroup: "Full Body",
    secondaryMuscles: "Peito, Pernas, Core, Tríceps",
    equipment: "Peso do corpo",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Exercício completo (full body) que combina agachamento, flexão e salto. Excelente para condicionamento e queima calórica.",
    executionSteps:
      "1. Em pé, pés na largura dos ombros.\n2. Agache e coloque as mãos no chão.\n3. Jogue os pés para trás em posição de flexão.\n4. Faça uma flexão de braço.\n5. Traga os pés de volta para as mãos.\n6. Salte para cima com os braços estendidos. Repita.",
    commonMistakes:
      "Pular a flexão; joelhos para dentro; não amortecer o salto; fazer rápido demais.",
    tips: "Ajuste o ritmo conforme seu condicionamento. Foque na técnica antes da velocidade.",
  },
{
    name: "Mountain Climber",
    slug: "mountain-climber",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Ombros, Tríceps, Pernas",
    equipment: "Peso do corpo",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício dinâmico em posição de prancha que trabalha core, ombros e cardio. Excelente para HIIT e condicionamento.",
    executionSteps:
      "1. Comece em posição de prancha alta.\n2. Mãos alinhadas com os ombros.\n3. Traga um joelho ao peito.\n4. Volte à posição de prancha.\n5. Alterne as pernas rapidamente.\n6. Continue pelo tempo determinado.",
    commonMistakes:
      "Elevar o quadril; jogar o quadril para cima; arredondar as costas; pressa sem controle.",
    tips: "Mantenha o quadril baixo e estável. Comece devagar e acelere conforme ganha técnica.",
  },
{
    name: "Flexão Diamante",
    slug: "flexao-diamante",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Peito, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Variação da flexão de braço com as mãos juntas em formato de diamante. Foca mais no tríceps do que a flexão tradicional.",
    executionSteps:
      "1. Em posição de flexão, junte as mãos formando um diamante.\n2. Dedos indicadores e polegares se tocam.\n2. Mantenha o corpo reto como uma prancha.\n3. Desça o peito em direção às mãos.\n4. Empurre de volta à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes:
      "Elevar o quadril; não descer o suficiente; cotovelos muito abertos; usar impulso.",
    tips: "Se for muito difícil, faça com os joelhos no chão. Foque em manter o diamante.",
  },
{
    name: "Flexão Arqueira",
    slug: "flexao-arqueira",
    muscleGroup: "Peito",
    secondaryMuscles: "Ombros, Tríceps, Core",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Variação avançada da flexão onde um braço se estende enquanto o outro faz o trabalho. Excelente para força unilateral.",
    executionSteps:
      "1. Posicione as mãos bem mais abertas que os ombros.\n2. Desça o corpo em direção a uma mão.\n3. Enquanto desce, estenda o outro braço lateralmente.\n4. Empurre de volta à posição central.\n5. Alterne os lados a cada repetição.",
    commonMistakes:
      "Quadril caído; não estender totalmente o braço; usar impulso; falta de mobilidade.",
    tips: "Exige bastante força e mobilidade. Comece com amplitude menor e vá aumentando.",
  },
{
    name: "Supino Declinado com Halteres",
    slug: "supino-declinado-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do supino no banco declinado que enfatiza a porção inferior (esternocostal) do peitoral maior.",
    executionSteps:
      "1. Ajuste o banco em declínio de 15 a 30 graus.\n2. Segure os halteres e deite-se, posicionando-os acima do peito.\n3. Desça os halteres em arco controlado até a altura do peito inferior.\n4. Empurre de volta à posição inicial contraindo o peito.\n5. Repita pelo número de repetições.",
    commonMistakes: "Descer rápido demais; arquear a lombar; não controlar a simetria; cotovelos muito abertos.",
    tips: "Use um banco com suporte para os pés para evitar deslizar. Cuidado ao levantar os halteres do chão.",
  },
{
    name: "Crossover com Polia Baixa",
    slug: "crossover-baixa",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior, Bíceps",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Variação do crossover realizada a partir de polias baixas, com maior ênfase na porção superior do peitoral.",
    executionSteps:
      "1. Posicione as polias na altura mais baixa.\n2. Segure as alças e posicione-se no centro.\n3. Em movimento ascendente, cruze as mãos à frente do rosto.\n4. Retorne controladamente à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes: "Usar muito peso; jogar o corpo para frente; não contrair o peito no ápice; descer rápido.",
    tips: "Incline levemente o tronco à frente para melhor ativação do peitoral superior.",
  },
{
    name: "Crucifixo Declinado com Halteres",
    slug: "crucifixo-declinado-halteres",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do crucifixo em banco declinado com foco na porção inferior do peitoral.",
    executionSteps:
      "1. Ajuste o banco em declínio de 15 a 30 graus.\n2. Deite-se com halteres acima do peito inferior.\n3. Abra os braços em arco até alongar o peito.\n4. Retorne contraindo a porção inferior do peito.\n5. Repita pelo número de repetições.",
    commonMistakes: "Descer rápido demais; não controlar a descida; cotovelos muito abertos.",
    tips: "Use peso moderado. A focagem no peito inferior é o que torna o exercício eficiente.",
  },
{
    name: "Flexão Inclinada",
    slug: "flexao-inclinada",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Variação mais fácil da flexão, com mãos elevadas. Foco na porção inferior do peito.",
    executionSteps:
      "1. Apoie as mãos em um banco, cadeira ou superfície elevada.\n2. Posicione o corpo em prancha inclinada.\n3. Desça o peito em direção ao apoio.\n4. Empurre de volta.\n5. Repita pelo número de repetições.",
    commonMistakes: "Quadril caído; não descer o suficiente; cotovelos abertos.",
    tips: "Ideal para iniciantes ou como finalizador de treino.",
  },
{
    name: "Flexão Declinada",
    slug: "flexao-declinada",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Variação mais difícil da flexão, com pés elevados. Foco na porção superior do peito e ombros.",
    executionSteps:
      "1. Apoie os pés em um banco ou superfície elevada.\n2. Mãos no chão, um pouco mais abertas que os ombros.\n3. Desça o peito em direção ao chão.\n4. Empurre de volta.\n5. Repita pelo número de repetições.",
    commonMistakes: "Quadril caído; cotovelos abertos; não descer o suficiente.",
    tips: "Quanto mais alta a superfície dos pés, maior a dificuldade e o foco no ombro.",
  },
{
    name: "Paralelas (Bulgaro)",
    slug: "paralelas",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Exercício em barras paralelas excelente para peito e tríceps. Inclinar o tronco à frente enfatiza o peito.",
    executionSteps:
      "1. Suba nas barras paralelas apoiando o peso nos braços estendidos.\n2. Incline levemente o tronco à frente (para foco no peito).\n3. Desça flexionando cotovelos até sentir alongamento no peito.\n4. Empurre de volta à posição inicial.\n5. Repita pelo número de repetições.",
    commonMistakes: "Não descer o suficiente; balançar o corpo; cotovelos para fora; encolher ombros.",
    tips: "Para tríceps, mantenha tronco ereto. Para peito, incline o tronco à frente.",
  },
{
    name: "Press de Peito na Máquina",
    slug: "press-peito-maquina",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Exercício guiado em máquina que simula o supino reto. Excelente para iniciantes e finalização.",
    executionSteps:
      "1. Ajuste o assento para que as alças fiquem na altura do peito.\n2. Sentado, costas apoiadas, segure as alças.\n3. Empurre as alças para frente contraindo o peito.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Não ajustar a altura; não apoiar bem as costas; usar impulso.",
    tips: "Útil para iniciantes aprenderem o padrão de movimento e para finalização com burnout.",
  },
{
    name: "Peck Deck (Máquina)",
    slug: "peck-deck-maquina",
    muscleGroup: "Peito",
    secondaryMuscles: "Deltoide Anterior",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Máquina específica para isolamento do peitoral, simulando o movimento do crucifixo com trajetória guiada.",
    executionSteps:
      "1. Ajuste o assento para que os cotovelos fiquem na altura do peito.\n2. Apoie os antebraços nas almofadas.\n4. Junte as almofadas à frente do peito contraindo.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Usar muito peso; não ajustar a altura; jogar o corpo para trás.",
    tips: "Excelente para finalização de treino. Foque na contração no centro.",
  },
{
    name: "Supino com Halteres no Banco Plano",
    slug: "supino-halteres-plano",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Alternativa ao supino reto com halteres, oferecendo maior amplitude e trabalho estabilizador.",
    executionSteps:
      "1. Deite-se em banco plano com halteres acima do peito.\n2. Segure os halteres com pegada firme, cotovelos estendidos.\n3. Desça controladamente até a altura do peito.\n4. Empurre de volta contraindo o peito.\n5. Repita pelo número de repetições.",
    commonMistakes: "Arquear a lombar; descer rápido; não alinhar os halteres.",
    tips: "Mantenha as escápulas retraídas. Excelente para hipertrofia e simetria.",
  },
{
    name: "Barra Fixa Supinada (Chin-up)",
    slug: "barra-fixa-supinada",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Variação da barra fixa com pegada supinada. Maior recrutamento de bíceps, ligeiramente mais fácil para iniciantes.",
    executionSteps:
      "1. Pendure-se na barra com pegada supinada (palmas para você) na largura dos ombros.\n2. Ative o core.\n3. Puxe o corpo até o queixo passar a barra.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Usar impulso; não estender totalmente os braços; jogar o corpo.",
    tips: "Excelente para iniciantes em barra fixa. Também trabalha bastante o bíceps.",
  },
{
    name: "Puxada na Polia (Pegada Neutra)",
    slug: "puxada-neutra",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação da puxada frontal com pegada neutra. Mais confortável para ombros e excelente para iniciantes.",
    executionSteps:
      "1. Sente-se na máquina de puxada com pegada neutra (palmas uma para a outra).\n2. Trave as coxas sob o suporte.\n3. Puxe a barra até a altura do peito, contraindo as costas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Puxar com os braços; jogar o corpo para trás; não controlar a subida.",
    tips: "Foque em puxar com os cotovelos, não com as mãos. Imagine cotovelos para baixo.",
  },
{
    name: "Puxada na Polia (Pegada Triângulo)",
    slug: "puxada-triangulo",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação da puxada frontal com pegada triângulo (V-bar), maior foco na porção central das costas.",
    executionSteps:
      "1. Sente-se na máquina com pegada no triângulo (pegada neutra fechada).\n2. Trave as coxas.\n3. Puxe o triângulo até o peito superior, contraindo as costas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Puxar com os braços; jogar o corpo; encolher os ombros.",
    tips: "Excelente para foco no centro das costas. Foque em juntar as escápulas.",
  },
{
    name: "Remada Curvada com Pegada Supinada",
    slug: "remada-curvada-supinada",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação da remada curvada com pegada supinada. Maior recrutamento de bíceps e porção inferior das costas.",
    executionSteps:
      "1. Em pé, segure a barra com pegada supinada na largura dos ombros.\n2. Incline o tronco à frente (~45°), costas retas.\n3. Puxe a barra até a altura do abdômen inferior.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Arredondar a lombar; usar impulso; puxar com os braços.",
    tips: "Excelente para combinar costas e bíceps. Mantenha o core firme.",
  },
{
    name: "Remada T-Bar",
    slug: "remada-tbar",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Antebraço, Posteriores",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Remada com barra T (ou barra comum em suporte), permite carga elevada e foco em espessura das costas.",
    executionSteps:
      "1. Posicione-se sobre a barra T, com os pés firmes.\n2. Segure as alças, costas retas, joelhos levemente flexionados.\n3. Puxe as alças até o peito inferior, contraindo as costas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Arredondar a lombar; usar impulso; encolher os ombros.",
    tips: "Excelente para hipertrofia. Foque em contrair as escápulas no ápice.",
  },
{
    name: "Remada Serrote",
    slug: "remada-serrote",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps, Core, Posteriores",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Variação avançada da remada curvada onde a barra toca o chão a cada repetição. Excelente para força e potência.",
    executionSteps:
      "1. Segure a barra com pegada pronada na largura dos ombros.\n2. Incline o tronco à frente (~45°), costas retas.\n3. Puxe a barra até o abdômen inferior.\n4. Desça até a barra tocar o chão.\n5. Repita imediatamente.",
    commonMistakes: "Arredondar a lombar; usar impulso; não tocar o chão entre reps.",
    tips: "Excelente para força. Mantenha a postura rígida. Use cinto para cargas elevadas.",
  },
{
    name: "Remada Baixa na Polia com Pegada Neutra",
    slug: "remada-baixa-neutra",
    muscleGroup: "Costas",
    secondaryMuscles: "Bíceps",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação da remada baixa com pegada neutra (V-bar). Mais confortável para ombros.",
    executionSteps:
      "1. Sente-se no banco da polia baixa, pés apoiados.\n2. Segure o triângulo com pegada neutra.\n3. Puxe até o abdômen, contraindo as costas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Jogar o corpo para trás; encolher os ombros; puxar com os braços.",
    tips: "Mantenha o tronco estável. Foque em contrair as escápulas.",
  },
{
    name: "Pullover na Polia Alta",
    slug: "pullover-polia-alta",
    muscleGroup: "Costas",
    secondaryMuscles: "Peito, Serrátil, Tríceps",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Pullover realizado com cabo na polia alta. Foca no latíssimo do dorso com tensão constante.",
    executionSteps:
      "1. Posicione-se de pé ou sentado de frente para a polia alta.\n2. Segure a barra ou corda com braços estendidos.\n3. Desça a barra em arco até as coxas, contraindo as costas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Flexionar cotovelos; usar impulso; não controlar a subida.",
    tips: "Mantenha cotovelos fixos. Excelente para finalização de costas.",
  },
{
    name: "Pull-down na Polia (Pullover)",
    slug: "pull-down-polia",
    muscleGroup: "Costas",
    secondaryMuscles: "Peito, Serrátil",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Exercício de isolamento para latíssimo do dorso, com cabo na polia alta.",
    executionSteps:
      "1. Deite-se em banco sob a polia alta ou fique em pé.\n2. Segure a barra com braços estendidos.\n3. Puxe a barra em arco até as coxas.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Flexionar cotovelos; usar impulso; não controlar a subida.",
    tips: "Excelente para isolamento do latíssimo. Mantenha cotovelos fixos.",
  },
{
    name: "Levantamento Terra Romeno",
    slug: "terra-romeno",
    muscleGroup: "Posteriores",
    secondaryMuscles: "Glúteos, Costas, Antebraço",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação do terra com joelhos mais estendidos, foco em posteriores de coxa e glúteos. Menos carga que o terra convencional.",
    executionSteps:
      "1. Em pé, segure a barra com pegada pronada na largura dos ombros.\n2. Joelhos levemente flexionados (fixos).\n3. Incline o quadril para trás, descendo a barra rente às coxas.\n4. Vá até sentir alongamento nos posteriores (geralmente meio da canela).\n5. Retorne contraindo glúteos e posteriores. Repita.",
    commonMistakes: "Arredondar a lombar; flexionar demais os joelhos; descer rápido demais.",
    tips: "Mantenha a barra rente ao corpo. Excelente para hipertrofia de posteriores.",
  },
{
    name: "Levantamento Terra Sumô",
    slug: "terra-sumo",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Posteriores, Costas, Core",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Variação do terra com pés bem abertos e pontas para fora. Maior recrutamento de adutores e quadríceps.",
    executionSteps:
      "1. Pés bem abertos, pontas levemente para fora.\n2. Incline e segure a barra no meio, com braços dentro das pernas.\n3. Costas retas, peito alto.\n4. Estenda quadril e joelhos simultaneamente.\n5. Desça controladamente. Repita.",
    commonMistakes: "Joelhos para dentro; arredondar a lombar; não abrir os pés o suficiente.",
    tips: "Excelente para quem tem pouca mobilidade no terra convencional.",
  },
{
    name: "Good Morning com Barra",
    slug: "good-morning-barra",
    muscleGroup: "Posteriores",
    secondaryMuscles: "Glúteos, Lombar, Core",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Exercício clássico para posteriores e lombar. A barra é apoiada no trapézio, como no agachamento.",
    executionSteps:
      "1. Barra apoiada no trapézio superior, como no agachamento.\n2. Em pé, pés na largura do quadril.\n3. Incline o tronco à frente, empurrando o quadril para trás.\n4. Vá até o tronco ficar quase paralelo ao chão.\n5. Retorne à posição ereta. Repita.",
    commonMistakes: "Arredondar a lombar; flexionar joelhos demais; usar muito peso.",
    tips: "Use peso moderado. Excelente para fortalecer posteriores e lombar.",
  },
{
    name: "Mesa Flexora Sentada",
    slug: "mesa-flexora-sentada",
    muscleGroup: "Posteriores",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação da mesa flexora realizada sentada. Foco maior na porção lateral do posterior (cabeça curta).",
    executionSteps:
      "1. Sente-se na máquina, costas apoiadas.\n2. Posicione as pernas sob a almofada.\n3. Flexione os joelhos contraindo os posteriores.\n4. Retorne controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Jogar o corpo para trás; não controlar a subida; usar impulso.",
    tips: "Excelente para finalização. Combine com a versão deitada para completo desenvolvimento.",
  },
{
    name: "Cadeira Flexora Unilateral",
    slug: "cadeira-flexora-unilateral",
    muscleGroup: "Posteriores",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Versão unilateral da cadeira flexora, ideal para corrigir assimetrias.",
    executionSteps:
      "1. Deite-se na cadeira flexora.\n2. Use apenas uma perna por vez.\n3. Flexione o joelho contraindo o posterior.\n4. Retorne controladamente.\n5. Repita e troque de perna.",
    commonMistakes: "Usar muito peso; não controlar a subida; jogar o quadril.",
    tips: "Use peso moderado. Excelente para identificar e corrigir assimetrias.",
  },
{
    name: "Agachamento Hack",
    slug: "agachamento-hack",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Intermediário",
    description:
      "Agachamento na máquina Hack, com carga guiada. Excelente para isolamento de quadríceps.",
    executionSteps:
      "1. Posicione-se na máquina, costas apoiadas, ombros sob as almofadas.\n2. Pés na plataforma, pontas levemente para fora.\n3. Libere a segurança.\n4. Desça flexionando joelhos.\n5. Suba contraindo quadríceps. Repita.",
    commonMistakes: "Joelhos para dentro; não descer o suficiente; arredondar a lombar.",
    tips: "Excelente para hipertrofia de quadríceps. Use amplitude completa.",
  },
{
    name: "Avanço (Lunge)",
    slug: "avanco-lunge",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício unilateral dinâmico. Excelente para quadríceps, glúteos e equilíbrio.",
    executionSteps:
      "1. Em pé, halteres nas mãos (ou sem peso).\n2. Dê um passo à frente e desça flexionando ambos os joelhos.\n3. O joelho de trás quase toca o chão.\n4. Empurre de volta à posição inicial.\n5. Alterne as pernas. Repita.",
    commonMistakes: "Joelho da frente passar a ponta do pé; joelhos para dentro; tronco inclinado.",
    tips: "Mantenha o tronco ereto. Excelente para treino funcional.",
  },
{
    name: "Avanço Lateral",
    slug: "avanco-lateral",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Adutores",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Variação do avanço para o lado. Maior foco em adutores e glúteo médio.",
    executionSteps:
      "1. Em pé, halteres nas mãos.\n2. Dê um passo largo para o lado.\n3. Flexione o joelho do lado do passo, mantendo a outra perna estendida.\n4. Empurre de volta à posição inicial.\n5. Alterne os lados. Repita.",
    commonMistakes: "Joelho para dentro; não flexionar o suficiente; inclinar o tronco.",
    tips: "Mantenha o peito alto. Excelente para desenvolvimento lateral das pernas.",
  },
{
    name: "Avanço Reverse",
    slug: "avanco-reverse",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Variação do avanço com passo para trás. Mais confortável para o joelho e maior foco em glúteos.",
    executionSteps:
      "1. Em pé, halteres nas mãos.\n2. Dê um passo atrás e desça flexionando ambos os joelhos.\n3. O joelho de trás quase toca o chão.\n4. Empurre de volta à posição inicial.\n5. Alterne as pernas. Repita.",
    commonMistakes: "Passo muito curto; joelho da frente passar a ponta do pé; inclinar o tronco.",
    tips: "Excelente para glúteos. Menos impacto no joelho que o lunge tradicional.",
  },
{
    name: "Panturrilha em Pé Unilateral",
    slug: "panturrilha-pe-unilateral",
    muscleGroup: "Panturrilhas",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão unilateral da panturrilha em pé, com halter. Excelente para focar em cada perna.",
    executionSteps:
      "1. Em pé sobre um degrau, halter em uma mão.\n2. Suba na ponta do pé, contraindo a panturrilha.\n3. Segure 1 segundo no ápice.\n4. Desça controladamente, alongando no final.\n5. Repita e troque de perna.",
    commonMistakes: "Não descer o suficiente; usar impulso; não segurar a contração.",
    tips: "Use um degrau para amplitude completa. Foque no alongamento na descida.",
  },
{
    name: "Hip Thrust com Halteres",
    slug: "hip-thrust-halteres",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão do hip thrust com halter sobre o quadril. Mais simples para iniciantes.",
    executionSteps:
      "1. Costas apoiadas em um banco, halter sobre o quadril.\n2. Pés firmes no chão.\n3. Empurre o quadril para cima, contraindo os glúteos.\n4. No ápice, contraia fortemente.\n5. Desça controladamente. Repita.",
    commonMistakes: "Arquear a lombar; não contrair glúteos; pés muito longe.",
    tips: "Excelente para iniciantes. Substitui a barra com mais conforto.",
  },
{
    name: "Glúteo na Polia (Coice)",
    slug: "gluteo-coice-polia",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Coice na polia baixa, excelente para isolamento do glúteo máximo.",
    executionSteps:
      "1. Posicione a polia na altura baixa, com alça no tornozelo.\n2. Em pé, apoie-se em algo para equilíbrio.\n3. Estenda a perna para trás, contraindo o glúteo.\n4. Segure 1 segundo no ápice.\n5. Retorne controladamente. Repita e troque de perna.",
    commonMistakes: "Arquear a lombar; usar impulso; jogar o quadril para frente.",
    tips: "Use peso moderado. Foque na contração do glúteo.",
  },
{
    name: "Abdução de Quadril na Polia",
    slug: "abducao-quadril-polia",
    muscleGroup: "Glúteos",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Abdução de quadril na polia baixa, foco no glúteo médio.",
    executionSteps:
      "1. Polia baixa com alça no tornozelo.\n2. Em pé de lado para a polia.\n3. Abra a perna para o lado, contraindo o glúteo médio.\n4. Segure 1 segundo no ápice.\n5. Retorne controladamente. Repita e troque de lado.",
    commonMistakes: "Girar o tronco; usar impulso; inclinar para o lado.",
    tips: "Use peso moderado. Excelente para estabilidade do quadril.",
  },
{
    name: "Elevação Pélvica (Glute Bridge)",
    slug: "elevacao-pelvica",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores, Core",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Versão do hip thrust no chão, sem equipamento. Excelente para iniciantes e ativação do glúteo.",
    executionSteps:
      "1. Deite-se de costas, joelhos flexionados, pés no chão.\n2. Empurre o quadril para cima, contraindo os glúteos.\n3. No ápice, contraia fortemente.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Arquear a lombar; não contrair glúteos; pés muito longe do corpo.",
    tips: "Excelente para ativação antes do treino. Pode ser feito com peso sobre o quadril.",
  },
{
    name: "Coice na Máquina",
    slug: "coice-maquina",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Posteriores",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Máquina específica para coice (extensão de quadril). Excelente para isolamento do glúteo.",
    executionSteps:
      "1. Posicione-se na máquina, joelho apoiado, pé na almofada.\n2. Empurre a almofada para trás, contraindo o glúteo.\n3. Segure 1 segundo no ápice.\n4. Retorne controladamente.\n5. Repita e troque de perna.",
    commonMistakes: "Arquear a lombar; usar impulso; não contrair glúteo.",
    tips: "Excelente para iniciantes. Trajetória guiada facilita o movimento.",
  },
{
    name: "Agachamento Sumô com Halter",
    slug: "agachamento-sumo-halter",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Quadríceps, Posteriores, Adutores",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Agachamento com pés bem abertos e pontas para fora. Maior foco em glúteos e adutores.",
    executionSteps:
      "1. Em pé, pés bem abertos, pontas para fora.\n2. Segure um halter com ambas as mãos, entre as pernas.\n3. Desça flexionando joelhos, mantendo o tronco ereto.\n4. Vá até as coxas ficarem paralelas.\n5. Suba contraindo glúteos. Repita.",
    commonMistakes: "Joelhos para dentro; inclinar o tronco; não descer o suficiente.",
    tips: "Excelente para desenvolvimento de glúteos e adutores.",
  },
{
    name: "Step Up",
    slug: "step-up",
    muscleGroup: "Glúteos",
    secondaryMuscles: "Quadríceps, Posteriores",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Subir em um degrau ou banco com halteres. Excelente para glúteos e pernas.",
    executionSteps:
      "1. Em pé de frente para um banco ou degrau, halteres nas mãos.\n2. Suba com um pé no banco.\n3. Estenda a perna, contraindo glúteo e quadríceps.\n4. Desça controladamente.\n5. Repita e troque de perna.",
    commonMistakes: "Empurrar com a perna de trás; não estender totalmente; inclinar o tronco.",
    tips: "Use altura desafiadora mas segura. Excelente para treino funcional.",
  },
{
    name: "Desenvolvimento na Máquina",
    slug: "desenvolvimento-maquina",
    muscleGroup: "Ombros",
    secondaryMuscles: "Tríceps",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Desenvolvimento guiado em máquina. Mais seguro e excelente para iniciantes.",
    executionSteps:
      "1. Sente-se na máquina, costas apoiadas.\n2. Segure as alças na altura dos ombros.\n3. Empurre as alças para cima.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Não ajustar a altura; não apoiar bem as costas; usar impulso.",
    tips: "Excelente para iniciantes e finalização. Trajetória guiada facilita.",
  },
{
    name: "Remada Alta com Halteres",
    slug: "remada-alta-halteres",
    muscleGroup: "Ombros",
    secondaryMuscles: "Trapézio, Bíceps",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Versão com halteres da remada alta. Excelente para deltoide lateral e trapézio.",
    executionSteps:
      "1. Em pé, halteres na frente das coxas, palmas para o corpo.\n2. Puxe os halteres verticalmente até a altura dos ombros, cotovelos para cima.\n3. Segure 1 segundo no ápice.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Jogar o corpo; cotovelos abaixo dos pulsos; usar pegada muito aberta.",
    tips: "Mantenha os halteres próximos ao corpo. Cotovelos lideram o movimento.",
  },
{
    name: "Elevação Frontal na Polia",
    slug: "elevacao-frontal-polia",
    muscleGroup: "Ombros",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Versão na polia da elevação frontal. Tensão constante.",
    executionSteps:
      "1. Polia baixa, alça na mão, de costas para a polia.\n2. Em pé, braço estendido à frente da coxa.\n3. Suba o braço até a altura do ombro.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita e troque de braço.",
    commonMistakes: "Subir acima do ombro; usar impulso; flexionar o cotovelo.",
    tips: "Excelente para tensão constante. Use pegada neutra ou pronada.",
  },
{
    name: "Crucifixo Inverso na Polia",
    slug: "crucifixo-inverso-polia",
    muscleGroup: "Ombros",
    secondaryMuscles: "Trapézio",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Versão na polia do crucifixo invertido. Excelente para deltoide posterior.",
    executionSteps:
      "1. Posicione duas polias na altura dos ombros.\n2. Segure a alça direita com a mão esquerda e vice-versa.\n3. Estenda os braços para trás, contraindo o deltoide posterior.\n4. Segure 1 segundo no ápice.\n5. Retorne controladamente. Repita.",
    commonMistakes: "Usar muito peso; não contrair; jogar o corpo.",
    tips: "Use peso moderado. Excelente para desenvolvimento do deltoide posterior.",
  },
{
    name: "Encolhimento na Máquina",
    slug: "encolhimento-maquina",
    muscleGroup: "Ombros",
    secondaryMuscles: "Trapézio",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Encolhimento de ombros na máquina. Trajetória guiada, mais seguro para cargas elevadas.",
    executionSteps:
      "1. Sente-se na máquina, ombros sob as almofadas.\n2. Suba os ombros em direção às orelhas.\n3. Segure 1 segundo no ápice.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Usar impulso; girar os ombros; não segurar a contração.",
    tips: "Excelente para iniciantes. Permite cargas elevadas com segurança.",
  },
{
    name: "Tríceps Francês com Halter",
    slug: "triceps-frances-halter",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Variação do tríceps francês com um halter segurado por ambas as mãos. Excelente para alongamento do tríceps.",
    executionSteps:
      "1. Deite-se em banco plano, halter acima do peito, segurando por dentro do disco.\n2. Flexione os cotovelos, descendo o halter em arco acima da cabeça.\n3. Vá até sentir alongamento no tríceps.\n4. Estenda os cotovelos, subindo o halter.\n5. Repita pelo número de repetições.",
    commonMistakes: "Abrir os cotovelos; arquear a lombar; descer rápido demais.",
    tips: "Mantenha os cotovelos fixos. Excelente para hipertrofia.",
  },
{
    name: "Tríceps Francês Sentado",
    slug: "triceps-frances-sentado",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Halter",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Tríceps francês sentado com halter. Excelente para alongamento e tensão constante.",
    executionSteps:
      "1. Sente-se em banco com encosto, halter acima da cabeça com ambas as mãos.\n2. Flexione os cotovelos, descendo o halter atrás da cabeça.\n3. Vá até sentir alongamento no tríceps.\n4. Estenda, subindo o halter.\n5. Repita pelo número de repetições.",
    commonMistakes: "Abrir os cotovelos; arquear a lombar; jogar os braços.",
    tips: "Mantenha os cotovelos próximos. Excelente para completo desenvolvimento.",
  },
{
    name: "Tríceps na Polia com Pegada Supinada",
    slug: "triceps-polia-supinada",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Variação do tríceps na polia com pegada supinada. Maior recrutamento da cabeça medial.",
    executionSteps:
      "1. Polia alta, barra com pegada supinada (palmas para cima).\n2. Em pé, cotovelos junto ao corpo.\n3. Estenda os cotovelos, empurrando a barra para baixo.\n4. Segure 1 segundo no ápice.\n5. Retorne controladamente. Repita.",
    commonMistakes: "Abrir os cotovelos; jogar o corpo; não controlar a subida.",
    tips: "Excelente para variação. Combine com a pegada pronada.",
  },
{
    name: "Mergulho em Banco (Bench Dip)",
    slug: "mergulho-banco",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Peito, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Mergulho apoiado em banco. Excelente para tríceps sem equipamento.",
    executionSteps:
      "1. Sente-se em um banco, mãos ao lado do quadril, dedos para frente.\n2. Desloque o quadril para frente do banco.\n3. Desça flexionando os cotovelos.\n4. Vá até 90° no cotovelo.\n5. Empurre de volta. Repita.",
    commonMistakes: "Descer rápido demais; abrir os cotovelos; jogar os ombros.",
    tips: "Para dificultar, estenda as pernas ou adicione peso sobre o quadril.",
  },
{
    name: "Tríceps na Máquina",
    slug: "triceps-maquina",
    muscleGroup: "Tríceps",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Máquina específica para tríceps. Trajetória guiada, excelente para iniciantes e finalização.",
    executionSteps:
      "1. Sente-se na máquina, costas apoiadas.\n2. Posicione os braços nas almofadas.\n3. Estenda os cotovelos, contraindo o tríceps.\n4. Segure 1 segundo no ápice.\n5. Retorne controladamente. Repita.",
    commonMistakes: "Jogar o corpo; não controlar a volta; usar impulso.",
    tips: "Excelente para iniciantes. Trajetória guiada isola o tríceps.",
  },
{
    name: "Flexão com Mãos Juntas (Diamond Push-up)",
    slug: "flexao-maos-juntas",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Peito, Deltoide Anterior",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Flexão com mãos juntas formando diamante. Excelente para tríceps.",
    executionSteps:
      "1. Em posição de flexão, junte as mãos formando um diamante.\n2. Mantenha o corpo reto.\n3. Desça o peito em direção às mãos.\n4. Empurre de volta.\n5. Repita pelo número de repetições.",
    commonMistakes: "Elevar o quadril; abrir os cotovelos; não descer o suficiente.",
    tips: "Se for muito difícil, faça com os joelhos no chão.",
  },
{
    name: "Rosca na Polia",
    slug: "rosca-polia",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Rosca na polia baixa com barra. Tensão constante durante todo o movimento.",
    executionSteps:
      "1. Polia baixa, barra com pegada supinada.\n2. Em pé, cotovelos junto ao corpo.\n3. Flexione os cotovelos, subindo a barra.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita.",
    commonMistakes: "Jogar o corpo; abrir os cotovelos; descer rápido.",
    tips: "Excelente para tensão constante. Combine com rosca livre.",
  },
{
    name: "Rosca Martelo na Polia",
    slug: "rosca-martelo-polia",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço, Braquiorradial",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Iniciante",
    description:
      "Rosca martelo na polia com corda. Excelente para braquiorradial.",
    executionSteps:
      "1. Polia baixa, corda com pegada neutra.\n2. Em pé, cotovelos junto ao corpo.\n3. Flexione os cotovelos, subindo a corda.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita.",
    commonMistakes: "Jogar o corpo; abrir os cotovelos; descer rápido.",
    tips: "Excelente para braquiorradial e antebraço. Tensão constante.",
  },
{
    name: "Rosca Inversa",
    slug: "rosca-inversa",
    muscleGroup: "Bíceps",
    secondaryMuscles: "Antebraço, Braquiorradial",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Rosca com pegada pronada. Maior recrutamento do braquiorradial.",
    executionSteps:
      "1. Em pé, barra com pegada pronada (palmas para baixo).\n2. Cotovelos junto ao corpo.\n3. Flexione os cotovelos, subindo a barra.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita.",
    commonMistakes: "Jogar o corpo; usar muito peso; abrir os cotovelos.",
    tips: "Use menos peso que a rosca supinada. Excelente para braquiorradial.",
  },
{
    name: "Flexão de Pulso com Halter",
    slug: "flexao-pulso-halter",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício para flexores do antebraço. Excelente para força de pegada.",
    executionSteps:
      "1. Sente-se em banco, antebraço apoiado na coxa.\n2. Halter na mão, palma para cima.\n3. Flexione o pulso, subindo o halter.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita e troque de mão.",
    commonMistakes: "Levantar o antebraço; usar muito peso; não controlar a descida.",
    tips: "Use peso moderado. Excelente para fortalecer a pegada.",
  },
{
    name: "Extensão de Pulso com Halter",
    slug: "extensao-pulso-halter",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Iniciante",
    description:
      "Exercício para extensores do antebraço. Importante para equilíbrio muscular.",
    executionSteps:
      "1. Sente-se em banco, antebraço apoiado na coxa.\n2. Halter na mão, palma para baixo.\n3. Estenda o pulso, subindo o halter.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita e troque de mão.",
    commonMistakes: "Levantar o antebraço; usar muito peso; não controlar.",
    tips: "Use peso moderado. Equilibre com flexão de pulso.",
  },
{
    name: "Encolhimento de Pulso (Wrist Curl Reverso)",
    slug: "encolhimento-pulso",
    muscleGroup: "Antebraço",
    secondaryMuscles: "",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Iniciante",
    description:
      "Exercício para antebraço com barra, pegada pronada. Excelente para força de pegada.",
    executionSteps:
      "1. Em pé, barra com pegada pronada.\n2. Estenda os braços, deixe a barra rolar para os dedos.\n3. Enrole os dedos e flexione o pulso para cima.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita.",
    commonMistakes: "Usar muito peso; flexionar os cotovelos; não controlar.",
    tips: "Excelente para força de pegada. Use peso moderado.",
  },
{
    name: "Abdominal Infra",
    slug: "abdominal-infra",
    muscleGroup: "Abdômen",
    secondaryMuscles: "",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Abdominal para porção inferior do reto abdominal. Excelente para abdômen inferior.",
    executionSteps:
      "1. Deite-se de costas, pernas estendidas.\n2. Mãos ao lado do quadril.\n3. Suba as pernas, mantendo-as estendidas.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita.",
    commonMistakes: "Flexionar os joelhos; arquear a lombar; usar impulso.",
    tips: "Mantenha a lombar pressionada no chão. Foque no abdômen inferior.",
  },
{
    name: "Prancha",
    slug: "prancha",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Core, Lombar",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Exercício isométrico para core. Excelente para estabilidade e postura.",
    executionSteps:
      "1. Em posição de prancha baixa, antebraços no chão.\n2. Cotovelos alinhados com os ombros.\n3. Corpo reto como uma tábua.\n4. Contraia o abdômen e glúteos.\n5. Segure pelo tempo determinado.",
    commonMistakes: "Quadril elevado ou caído; arredondar as costas; relaxar o core.",
    tips: "Comece com 20-30 segundos e vá aumentando. Qualidade acima de duração.",
  },
{
    name: "Elevação de Pernas na Barra",
    slug: "elevacao-pernas-barra",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Core, Quadríceps",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Elevação de pernas pendurado na barra fixa. Excelente para abdômen inferior e core.",
    executionSteps:
      "1. Pendure-se na barra fixa com pegada pronada.\n2. Suba as pernas estendidas até a altura do quadril (ou acima).\n3. Segure 1 segundo no ápice.\n4. Desça controladamente.\n5. Repita pelo número de repetições.",
    commonMistakes: "Balançar o corpo; flexionar os joelhos; usar impulso.",
    tips: "Comece com joelhos flexionados. Excelente para abdômen avançado.",
  },
{
    name: "Abdominal na bola Suíça",
    slug: "abdominal-bola-suica",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Core",
    equipment: "Bola",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Abdominal na bola suíça, com maior amplitude e ativação de estabilizadores.",
    executionSteps:
      "1. Deite-se com a lombar apoiada na bola suíça.\n2. Pés firmes no chão.\n3. Mãos atrás da cabeça.\n4. Contraia o abdômen, subindo o tronco.\n5. Desça controladamente, alongando na bola. Repita.",
    commonMistakes: "Puxar a cabeça; usar impulso; não usar a amplitude da bola.",
    tips: "Excelente para amplitude completa. Ativa estabilizadores.",
  },
{
    name: "Corrida na Esteira",
    slug: "corrida-esteira",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Core",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Corrida na esteira, excelente para cardio e queima calórica.",
    executionSteps:
      "1. Suba na esteira com cuidado.\n2. Ajuste a velocidade inicial baixa.\n3. Aumente gradualmente para a velocidade desejada.\n4. Mantenha postura ereta, olhar à frente.\n5. Corra pelo tempo determinado.",
    commonMistakes: "Inclinar muito à frente; segurar no painel; passada muito longa.",
    tips: "Use tênis adequado. Aqueça antes e desaqueça após.",
  },
{
    name: "Bicicleta Ergométrica",
    slug: "bicicleta-ergometrica",
    muscleGroup: "Pernas",
    secondaryMuscles: "Core",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Bicicleta ergométrica, excelente para cardio de baixo impacto.",
    executionSteps:
      "1. Ajuste o assento para a altura do quadril.\n2. Sente-se com costas eretas.\n3. Ajuste a resistência.\n4. Pedale continuamente.\n5. Continue pelo tempo determinado.",
    commonMistakes: "Assento muito baxo; joelhos flexionados demais; relaxar o core.",
    tips: "Excelente para iniciantes e recuperação. Baixo impacto.",
  },
{
    name: "Elíptico",
    slug: "eliptico",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Ombros, Core",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Treinador elíptico, excelente para cardio de baixo impacto trabalhando braços e pernas.",
    executionSteps:
      "1. Suba no elíptico, segure nas alças.\n2. Ajuste a resistência.\n3. Movimente pernas e braços alternadamente.\n4. Mantenha postura ereta.\n5. Continue pelo tempo determinado.",
    commonMistakes: "Inclinar muito à frente; usar só as pernas; olhar para baixo.",
    tips: "Excelente para cardio completo. Baixo impacto nas articulações.",
  },
{
    name: "Escada (StairMaster)",
    slug: "escada-stairmaster",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Intermediário",
    description:
      "Simulador de escada, excelente para cardio de alta queima calórica e fortalecimento de pernas e glúteos.",
    executionSteps:
      "1. Suba na máquina segurando levemente no corrimão.\n2. Ajuste a velocidade/nível inicial baixo.\n3. Pise com o pé inteiro em cada degrau, sem se apoiar no corrimão.\n4. Mantenha a postura ereta, core ativado.\n5. Continue no ritmo determinado pelo tempo do treino.",
    commonMistakes: "Apoiar todo o peso nos braços; passos muito curtos; encurvar as costas.",
    tips: "Evite se apoiar demais no corrimão — isso reduz o gasto calórico e o trabalho muscular.",
  },
{
    name: "Caminhada Inclinada na Esteira",
    slug: "caminhada-inclinada-esteira",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Panturrilhas, Core",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Caminhada em inclinação na esteira, ótima para cardio de baixo impacto com maior ativação de posterior de coxa e glúteos.",
    executionSteps:
      "1. Suba na esteira e comece em velocidade baixa, sem inclinação.\n2. Aumente gradualmente a inclinação.\n3. Ajuste a velocidade para um ritmo de caminhada confortável.\n4. Mantenha postura ereta, sem se apoiar no painel.\n5. Continue pelo tempo determinado.",
    commonMistakes: "Segurar no painel; passos muito curtos; inclinação alta demais no início.",
    tips: "Ótima alternativa de baixo impacto à corrida para quem busca queima calórica.",
  },
{
    name: "Remo Ergômetro",
    slug: "remo-ergometro",
    muscleGroup: "Full Body",
    secondaryMuscles: "Costas, Pernas, Core, Ombros",
    equipment: "Máquina",
    category: "Cardio",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Máquina de remo, excelente para cardio e trabalho completo do corpo.",
    executionSteps:
      "1. Sente-se no remo, pés nas alças.\n2. Segure a alça, joelhos flexionados.\n3. Estenda as pernas, depois puxe a alça até o peito.\n4. Retorne na ordem inversa (braços, tronco, pernas).\n5. Continue pelo tempo determinado.",
    commonMistakes: "Puxar com os braços primeiro; arredondar as costas; não usar as pernas.",
    tips: "Aprenda a técnica correta. Excelente para cardio completo.",
  },
{
    name: "Pular Corda",
    slug: "pular-corda",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Ombros, Core",
    equipment: "Corda",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Iniciante",
    description:
      "Pular corda, excelente para cardio, coordenação e queima calórica.",
    executionSteps:
      "1. Segure a corda pelas extremidades.\n2. Comece com a corda atrás dos pés.\n3. Balance a corda por cima da cabeça.\n4. Salte quando a corda passar sob os pés.\n5. Continue pelo tempo determinado.",
    commonMistakes: "Saltar muito alto; usar os braços para girar; sem amortecimento.",
    tips: "Use tênis adequado. Comece devagar e aumente a velocidade.",
  },
{
    name: "Burpee com Salto",
    slug: "burpee-salto",
    muscleGroup: "Full Body",
    secondaryMuscles: "Peito, Pernas, Core, Tríceps",
    equipment: "Peso do corpo",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Burpee tradicional com salto no final. Excelente para condicionamento.",
    executionSteps:
      "1. Em pé, pés na largura dos ombros.\n2. Agache e coloque as mãos no chão.\n3. Jogue os pés para trás em posição de flexão.\n4. Faça uma flexão.\n5. Traga os pés de volta para as mãos.\n6. Salte para cima com os braços estendidos. Repita.",
    commonMistakes: "Pular a flexão; joelhos para dentro; não amortecer o salto.",
    tips: "Ajuste o ritmo conforme seu condicionamento.",
  },
{
    name: "Battle Rope (Corda Naval)",
    slug: "battle-rope",
    muscleGroup: "Full Body",
    secondaryMuscles: "Ombros, Core, Costas",
    equipment: "Corda",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Treino com corda naval, excelente para cardio e potência de ombros e core.",
    executionSteps:
      "1. Segure as extremidades da corda, uma em cada mão.\n2. Posicione-se em agachamento parcial.\n3. Movimente os braços alternadamente, criando ondas na corda.\n4. Mantenha o core firme.\n5. Continue pelo tempo determinado.",
    commonMistakes: "Usar só os braços; arredondar as costas; relaxar o core.",
    tips: "Use peso corporal para gerar potência. Excelente para HIIT.",
  },
{
    name: "Box Jump",
    slug: "box-jump",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Box",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Salto em caixa. Excelente para potência de pernas e cardio.",
    executionSteps:
      "1. Em pé de frente para o box.\n2. Agache parcialmente.\n3. Salte para o box, aterrissando com ambos os pés.\n4. Estenda totalmente no topo.\n5. Desça cuidadosamente. Repita.",
    commonMistakes: "Aterrissar duro; joelhos para dentro; usar box muito alto.",
    tips: "Use tênis adequado. Comece com altura baixa.",
  },
{
    name: "Wall Ball",
    slug: "wall-ball",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Ombros, Core",
    equipment: "Bola",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Exercício com bola medicinal contra a parede. Excelente para condicionamento.",
    executionSteps:
      "1. Em pé de frente para uma parede, bola medicinal no peito.\n2. Agache até paralelo.\n3. Suba, projetando a bola contra a parede.\n4. Pegue a bola no retorno.\n5. Continue o movimento. Repita.",
    commonMistakes: "Não agachar o suficiente; jogar a bola muito baixo; relaxar o core.",
    tips: "Use peso adequado. Excelente para HIIT.",
  },
{
    name: "Prancha com Toque no Ombro",
    slug: "prancha-toque-ombro",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Ombros, Core",
    equipment: "Peso do corpo",
    category: "Hipertrofia",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Prancha dinâmica com toque no ombro. Excelente para core e estabilidade.",
    executionSteps:
      "1. Em posição de prancha alta, mãos no chão.\n2. Toque o ombro direito com a mão esquerda.\n3. Retorne a mão ao chão.\n4. Toque o ombro esquerdo com a mão direita.\n5. Continue alternando. Repita.",
    commonMistakes: "Balançar o quadril; elevar o quadril; relaxar o core.",
    tips: "Mantenha o quadril estável. Excelente para core.",
  },
{
    name: "Cadeira Flexora em Pé",
    slug: "cadeira-flexora-pe",
    muscleGroup: "Posteriores",
    secondaryMuscles: "",
    equipment: "Máquina",
    category: "Hipertrofia",
    equipmentType: "Máquina",
    level: "Iniciante",
    description:
      "Variação da cadeira flexora realizada em pé. Excelente para isolamento do posterior.",
    executionSteps:
      "1. Em pé na máquina, uma perna por vez.\n2. Posicione a almofada no tornozelo.\n3. Flexione o joelho, contraindo o posterior.\n4. Segure 1 segundo no ápice.\n5. Desça controladamente. Repita e troque de perna.",
    commonMistakes: "Jogar o corpo; usar impulso; não contrair.",
    tips: "Excelente para trabalho unilateral. Use peso moderado.",
  },
{
    name: "Agachamento Pistol",
    slug: "agachamento-pistol",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos, Core",
    equipment: "Peso do corpo",
    category: "Força",
    equipmentType: "Peso do corpo",
    level: "Avançado",
    description:
      "Agachamento unilateral avançado com uma perna estendida à frente. Excelente para força e equilíbrio.",
    executionSteps:
      "1. Em pé sobre uma perna, outra estendida à frente.\n2. Estenda os braços à frente para equilíbrio.\n3. Desça flexionando o joelho de apoio.\n4. Vá até quase tocar o chão com o quadril.\n5. Suba contraindo quadríceps. Repita e troque de perna.",
    commonMistakes: "Joelho para dentro; não estender a perna; cair para o lado.",
    tips: "Exige muita força e equilíbrio. Use apoio no início.",
  },
{
    name: "Sissy Squat",
    slug: "sissy-squat",
    muscleGroup: "Pernas",
    secondaryMuscles: "Core",
    equipment: "Máquina",
    category: "Força",
    equipmentType: "Máquina",
    level: "Avançado",
    description:
      "Agachamento que enfatiza o quadríceps, com joelhos avançando bastante. Excelente para isolamento.",
    executionSteps:
      "1. Posicione-se na máquina Sissy, pés travados.\n2. Mantenha o corpo ereto.\n3. Incline o tronco para trás, flexionando os joelhos.\n4. Vá até sentir alongamento no quadríceps.\n5. Suba contraindo o quadríceps. Repita.",
    commonMistakes: "Arredondar as costas; descer rápido demais; não contrair.",
    tips: "Exige técnica. Comece sem peso para aprender.",
  },
{
    name: "Agachamento com Pulsão (Jump Squat)",
    slug: "agachamento-pulsao",
    muscleGroup: "Pernas",
    secondaryMuscles: "Glúteos",
    equipment: "Peso do corpo",
    category: "Cardio",
    equipmentType: "Peso do corpo",
    level: "Intermediário",
    description:
      "Agachamento pliométrico com salto. Excelente para potência e cardio.",
    executionSteps:
      "1. Em pé, pés na largura dos ombros.\n2. Agache até paralelo.\n3. Exploda para cima saltando.\n4. Aterre suavemente flexionando os joelhos.\n5. Imediatamente agache novamente. Repita.",
    commonMistakes: "Aterrissar duro; joelhos para dentro; não amortecer.",
    tips: "Use tênis adequado. Excelente para atletas e HIIT.",
  },
{
    name: "Thruster",
    slug: "thruster",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Ombros, Tríceps, Core",
    equipment: "Halteres",
    category: "Força",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Exercício composto que combina agachamento e desenvolvimento. Excelente para condicionamento.",
    executionSteps:
      "1. Halteres nos ombros, em pé.\n2. Agache até paralelo.\n3. Suba, empurrando os halteres para cima (desenvolvimento).\n4. Desça os halteres aos ombros.\n5. Repita pelo número de repetições.",
    commonMistakes: "Não usar as pernas; arquear a lombar; não estender totalmente.",
    tips: "Excelente para CrossFit e condicionamento. Use peso moderado.",
  },
{
    name: "Turkish Get-up",
    slug: "turkish-get-up",
    muscleGroup: "Full Body",
    secondaryMuscles: "Core, Ombros, Pernas",
    equipment: "Kettlebell",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Exercício funcional avançado que envolve levantar-se do chão com peso. Excelente para core e coordenação.",
    executionSteps:
      "1. Deite-se, kettlebell em uma mão estendida para cima.\n2. Apoie-se no cotovelo oposto.\n3. Levante o tronco, apoie a mão no chão.\n4. Levante o quadril, posicione o joelho.\n5. Levante-se em posição de afundo, depois em pé.\n6. Desça na ordem inversa. Repita.",
    commonMistakes: "Mover rápido demais; tirar o olho do peso; arredondar as costas.",
    tips: "Comece sem peso para aprender a técnica. Excelente para core.",
  },
{
    name: "Clean and Press",
    slug: "clean-and-press",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Costas, Ombros, Tríceps",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Exercício olímpico que combina levantamento (clean) e desenvolvimento (press). Excelente para potência total.",
    executionSteps:
      "1. Barra no chão, pegada na largura dos ombros.\n2. Puxe a barra, explodindo com as pernas.\n3. Pegue a barra nos ombros (rack position).\n4. Empurre a barra para cima (desenvolvimento).\n5. Desça controladamente. Repita.",
    commonMistakes: "Arredondar a lombar; não usar as pernas; jogar a barra.",
    tips: "Exige técnica. Aprenda com profissional. Excelente para potência.",
  },
{
    name: "Snatch (Arranco)",
    slug: "snatch",
    muscleGroup: "Full Body",
    secondaryMuscles: "Pernas, Costas, Ombros",
    equipment: "Barra",
    category: "Força",
    equipmentType: "Livre",
    level: "Avançado",
    description:
      "Exercício olímpico avançado que leva a barra do chão ao topo em um movimento. Excelente para potência.",
    executionSteps:
      "1. Barra no chão, pegada bem aberta.\n2. Puxe a barra, explodindo com as pernas.\n3. Em um movimento, pegue a barra estendida acima da cabeça.\n4. Agache sob a barra.\n5. Levante-se com a barra estendida. Repita.",
    commonMistakes: "Arredondar a lombar; usar os braços; não agachar sob a barra.",
    tips: "Exige muita técnica. Aprenda com profissional. Excelente para potência.",
  },
{
    name: "Supino Fechado com Barra",
    slug: "supino-fechado-barra",
    muscleGroup: "Tríceps",
    secondaryMuscles: "Peito, Deltoide Anterior",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Variação do supino com pegada fechada. Maior foco no tríceps.",
    executionSteps:
      "1. Deite-se em banco plano, barra com pegada na largura dos ombros.\n2. Segure a barra, cotovelos junto ao corpo.\n3. Desça a barra até o peito inferior.\n4. Empurre de volta, mantendo cotovelos fechados.\n5. Repita pelo número de repetições.",
    commonMistakes: "Abrir os cotovelos; arquear a lombar; usar muito peso.",
    tips: "Use pegada na largura dos ombros. Excelente para tríceps.",
  },
{
    name: "Supino com Pegada Neutra",
    slug: "supino-pegada-neutra",
    muscleGroup: "Peito",
    secondaryMuscles: "Tríceps, Deltoide Anterior",
    equipment: "Barra",
    category: "Hipertrofia",
    equipmentType: "Livre",
    level: "Intermediário",
    description:
      "Supino com pegada neutra (usando barra multipression). Mais confortável para ombros.",
    executionSteps:
      "1. Deite-se em banco plano, barra com pegada neutra.\n2. Segure a barra na largura dos ombros.\n3. Desça a barra até o peito.\n4. Empurre de volta.\n5. Repita pelo número de repetições.",
    commonMistakes: "Abrir os cotovelos; arquear a lombar; usar muito peso.",
    tips: "Excelente para quem tem desconforto nos ombros com pegada pronada.",
  },
{
    name: "Abdominal Oblíquo com Halter",
    slug: "abdominal-obliquo-halter",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Oblíquos",
    equipment: "Halteres",
    category: "Hipertrofia",
    equipmentType: "Halteres",
    level: "Intermediário",
    description:
      "Abdominal lateral com halter. Excelente para oblíquos.",
    executionSteps:
      "1. Em pé, halter em uma mão.\n2. Incline o tronco para o lado oposto ao halter.\n3. Volte contraindo os oblíquos do lado do halter.\n4. Continue pelo número de repetições.\n5. Troque de lado.",
    commonMistakes: "Inclinar à frente ou para trás; usar muito peso; movimentar o quadril.",
    tips: "Use peso moderado. Foque na contração lateral.",
  },
{
    name: "Woodchopper na Polia",
    slug: "woodchopper-polia",
    muscleGroup: "Abdômen",
    secondaryMuscles: "Oblíquos, Core",
    equipment: "Cabo",
    category: "Hipertrofia",
    equipmentType: "Cabo",
    level: "Intermediário",
    description:
      "Movimento de 'lenhador' na polia. Excelente para oblíquos e core.",
    executionSteps:
      "1. Posicione a polia alta, alça na mão.\n2. Em pé de lado para a polia.\n3. Puxe a alça em diagonal para baixo, do lado oposto.\n4. Rotacione o tronco, contraindo os oblíquos.\n5. Retorne controladamente. Repita e troque de lado.",
    commonMistakes: "Usar os braços; não rotacionar; jogar o corpo.",
    tips: "Use peso moderado. Foque na rotação do tronco.",
  },
];

export const muscleGroups = [
  "Peito",
  "Costas",
  "Pernas",
  "Glúteos",
  "Posteriores",
  "Ombros",
  "Tríceps",
  "Bíceps",
  "Abdômen",
  "Trapézio",
  "Antebraço",
  "Panturrilhas",
  "Full Body",
] as const;

export const equipmentTypes = [
  "Livre",
  "Máquina",
  "Cabo",
  "Halteres",
  "Peso do corpo",
] as const;

export const levels = ["Iniciante", "Intermediário", "Avançado"] as const;

export const categories = ["Força", "Hipertrofia", "Cardio", "Mobilidade"] as const;
