// Base de dados com 50+ exercícios mais usados nas academias do Brasil
// Cada exercício contém: nome, grupo muscular, equipamento, categoria, nível,
// descrição, execução passo a passo, erros comuns, dicas

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
};

export const exercisesData: ExerciseData[] = [
  // ===== PEITO =====
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

  // ===== COSTAS =====
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

  // ===== PERNAS =====
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

  // ===== OMBROS =====
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

  // ===== TRÍCEPS =====
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

  // ===== BÍCEPS =====
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

  // ===== ABDÔMEN =====
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

  // ===== TRAPÉZIO =====
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

  // ===== ANTEBRAÇO =====
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

  // ===== EXERCÍCIOS COMPLEMENTARES =====
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
];

export const muscleGroups = [
  "Peito",
  "Costas",
  "Pernas",
  "Glúteos",
  "Ombros",
  "Tríceps",
  "Bíceps",
  "Abdômen",
  "Trapézio",
  "Antebraço",
  "Panturrilhas",
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
