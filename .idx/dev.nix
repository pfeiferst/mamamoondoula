# To learn more about how to use Nix to configure your environment
# see: https://firebase.google.com/docs/studio/customize-workspace
let 
secrets = import ../.env-secrets;
in 
{ pkgs, ... }: {
  # Which nixpkgs channel to use.
  channel = "stable-24.05"; # or "unstable"
  
  # Use https://search.nixos.org/packages to find packages
  packages = [
    pkgs.nodejs_22  # Entspricht Node 24 aus dem devcontainer
    pkgs.pnpm      # Für package management
    # Minimale System dependencies für Puppeteer/Chrome
    pkgs.gtk3
    pkgs.libnotify
    pkgs.nss
    pkgs.alsa-lib
    pkgs.xorg.libXScrnSaver
    pkgs.gnome2.GConf    # GConf aus dem GNOME2 namespace
    # Chromium für Puppeteer (da Chrome nicht direkt in nixpkgs verfügbar)
    pkgs.chromium
  ];

  # Sets environment variables in the workspace
  

  env = pkgs.lib.recursiveUpdate {
    # Puppeteer soll das System-Chromium nutzen
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
    PUPPETEER_EXECUTABLE_PATH = "${pkgs.chromium}/bin/chromium";
  } secrets;
  
  idx = {
    # Search for the extensions you want on https://open-vsx.org/ and use "publisher.id"
    extensions = [
      "astro-build.astro-vscode"
      "unifiedjs.vscode-mdx"
      "dbaeumer.vscode-eslint"
      "esbenp.prettier-vscode"
      "bradlc.vscode-tailwindcss"
    ];
    
    # Enable previews
    previews = {
      enable = false;
      previews = {
        web = {
          command = ["pnpm" "run" "dev"];
          manager = "web";
          env = {
            PORT = "$PORT";
          };
        };
      };
    };
    
    # Workspace lifecycle hooks
    workspace = {
      # Runs when a workspace is first created
      onCreate = {
        # install-pnpm = "npm install -g pnpm";
        # install-deps = "pnpm install";
        # build-packages = "pnpm build:packages";
      };
      
      # Runs when the workspace is (re)started
      onStart = {
        # dev-server = "pnpm dev";
      };
    };
  };
}