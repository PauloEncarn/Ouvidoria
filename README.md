Sistema de Ouvidoria



Este projeto é um sistema de ouvidoria desenvolvido para gerenciar reclamações e interações de usuários em um ambiente organizacional. Construído com tecnologias modernas como Node.js, Express, PostgreSQL e Docker, o sistema oferece uma solução robusta, segura e escalável para facilitar a comunicação interna, garantindo autenticação segura, gerenciamento de usuários e administração de reclamações.

Visão Geral

O sistema permite que usuários registrem reclamações, visualizem seu status e que administradores gerenciem papéis e reclamações. Ele foi projetado com foco em segurança (autenticação JWT, criptografia de senhas com bcrypt) e facilidade de implantação (via Docker). Este projeto demonstra habilidades em desenvolvimento full-stack, integração com bancos de dados relacionais e orquestração de contêineres.

Funcionalidades





Autenticação Segura: Login baseado em JWT com senhas criptografadas usando bcrypt.



Gerenciamento de Usuários: Cadastro, edição e elevação de papéis (reclamador, ouvidor, configurador, administrador).



Registro de Reclamações: Submissão e acompanhamento de reclamações com status atualizável.



Painel Administrativo: Interface para administradores gerenciarem usuários e reclamações.



Implantação com Docker: Configuração simplificada com docker-compose para rodar a aplicação e o banco PostgreSQL.

Tecnologias Utilizadas





Backend: Node.js, Express



Banco de Dados: PostgreSQL



Autenticação: JSON Web Tokens (JWT), bcrypt



Frontend: HTML, CSS, JavaScript



Contêineres: Docker, Docker Compose



Outras Dependências: cors, pg

Estrutura do Projeto

.
├── Dockerfile              # Configuração do contêiner da aplicação
├── docker-compose.yml      # Orquestração do Docker (aplicação e PostgreSQL)
├── package.json            # Dependências e scripts do Node.js
├── server.js               # Backend com Express e integração com PostgreSQL
├── public/
│   ├── ouvidoria.html      # Interface principal
│   ├── script.js           # Lógica do frontend
│   ├── styles.css          # Estilos do frontend
└── .gitignore              # Arquivos ignorados pelo Git

Como Executar

Pré-requisitos





Node.js (18.20.8 ou superior)



Docker e Docker Compose



Git

Passos





Clonar o Repositório:

git clone https://github.com/PauloEncarn/Ouvidoria
cd Ouvidoria



Instalar Dependências:

npm install



Executar com Docker:

docker-compose up -d --build



Acessar a Aplicação:





Abra o navegador em http://localhost:3000.



Use as credenciais padrão fornecidas na configuração inicial.

Implantação em Rede Interna

Para hospedar em um servidor interno:





Configure um nome de servidor (ex.: ouvidoria.<domínio>.com) via DNS local ou arquivo hosts.



Ajuste o firewall para permitir tráfego na porta 3000:

netsh advfirewall firewall add rule name="Ouvidoria" dir=in action=allow protocol=TCP localport=3000 remoteip=192.168.0.0/16



Execute com docker-compose up -d --build.

Contribuição





Faça um fork do repositório.



Crie um branch para sua feature: git checkout -b minha-feature.



Commit suas alterações: git commit -m "Descrição da feature".



Envie para o repositório: git push origin minha-feature.



Abra um Pull Request no GitHub.

Publicando no GitHub

Para subir alterações ao repositório:





Adicione arquivos:

git add .



Faça o commit:

git commit -m "Descrição das alterações"



Sincronize com o remoto:

git pull origin main





Resolva conflitos, se necessário.



Envie para o GitHub:

git push -u origin main

Notas





Este é um projeto interno, mantido privado para proteger dados sensíveis.



Para mais detalhes, entre em contato via LinkedIn: Paulo Encarnação.

Sobre

Este projeto foi desenvolvido como uma solução prática para gerenciar comunicações internas, demonstrando competências em desenvolvimento backend, integração com bancos de dados e implantação com contêineres. Ideal para portfólios de desenvolvedores full-stack ou equipes interessadas em sistemas de ouvidoria escaláveis.