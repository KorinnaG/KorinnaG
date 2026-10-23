/**
 * Gabarits HTML des images du README, dans le style du portfolio : les
 * valeurs viennent des feuilles du portfolio (src/styles/ : jetons, héros de
 * l'accueil, bouton, carte de projet, titre de section), à l'échelle de la
 * maquette bureau (1 px ici = 1 px de maquette à 1440 px de large).
 *
 * Chaque image est une page dont l'élément #rendu est capturé à sa taille
 * réelle : boutons, titres et étiquettes suivent leur texte.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** Typographie française : espace insécable devant « ? », « ! », « : ». */
const typo = (s) => s.replace(/ ([?!:])/g, ' $1');

export function images({ portfolio, site, projets, config }) {
  const actif = (...p) => join(portfolio, 'src', 'assets', ...p);
  const url = (...p) => pathToFileURL(actif(...p)).href;
  const icone = (nom) => readFileSync(actif('icons', `${nom}.svg`), 'utf8');

  /** Trait dessiné du portfolio, étiré sous les mots comme .souligne > .trait. */
  function trait(nom) {
    const svg = icone(nom);
    const boite = svg.match(/viewBox="([^"]+)"/)[1];
    const d = svg.match(/\sd="([^"]+)"/)[1];
    return `<svg class="trait" viewBox="${boite}" preserveAspectRatio="none" overflow="visible" aria-hidden="true"><path d="${d}" stroke="#FF4941" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
  }

  /** Balisage léger du portfolio : [[mot]] (Rubik Mono One), ~~mots~~ (trait dessiné). */
  const riche = (texte, nomTrait = 'trait-souligne-court') =>
    esc(typo(texte))
      .replace(/\[\[(.+?)\]\]/g, '<em class="em">$1</em>')
      .replace(/~~(.+?)~~/g, (_, mots) => `<span class="souligne">${mots}${trait(nomTrait)}</span>`);

  const police = (famille, poids, fichier) => `@font-face{font-family:'${famille}';font-weight:${poids};src:url('${url('fonts', fichier)}') format('woff2')}`;

  const css = `
${police('Noto Sans', 400, 'noto-sans-400-normal-latin.woff2')}
${police('Noto Sans', 700, 'noto-sans-700-normal-latin.woff2')}
${police('Manrope', 600, 'manrope-600-normal-latin.woff2')}
${police('Rubik Mono One', 400, 'rubik-mono-one-400-normal-latin.woff2')}
:root {
  --noir: #0b031d;
  --blanc: #ffffff;
  --encre: #000000;
  --primaire: #ff4941;
  --mi: #89023e;
  --mi-clair: #d6246e;
  --rayon: 10px;
  --sans: 'Noto Sans', sans-serif;
  --titres: 'Manrope', 'Noto Sans', sans-serif;
  --mono: 'Rubik Mono One', 'Noto Sans', sans-serif;
}
html, body { margin: 0; background: transparent; }
body { font-family: var(--sans); color: var(--noir); -webkit-font-smoothing: antialiased; }
.em { font-family: var(--mono); font-style: normal; font-weight: 400; font-size: 1.075em; letter-spacing: 0; line-height: 1.25; }
.souligne { position: relative; display: inline-block; }
.trait { position: absolute; left: 0; top: calc(100% + 2px); width: 100%; height: 16px; overflow: visible; }

/* Titre du site : nom bicolore et sous-titre souligné du héros de l'accueil
   (06-accueil.css), sans photo ni logo ; même écart de 33 px entre le nom et
   le sous-titre. Les marges laissent la place au trait dessiné, qui déborde
   sous le sous-titre et à droite des mots. */
.principal { display: inline-block; padding: 4px 16px 20px 0; }
.principal__nom { margin: 0; font: 700 150px/119px var(--sans); }
.principal__prenom, .principal__famille { display: block; }
.principal__prenom { color: var(--primaire); }
.principal__famille { margin-top: 41px; padding-left: 7px; }
.principal__role { margin: 33px 0 0; font: 600 40px/1.25 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }
/* Thème sombre de GitHub : le bordeaux éclairci du site sur fond sombre (« mi-clair »). */
.principal--clair { color: var(--noir); }
.principal--clair .principal__famille { color: var(--mi); }
.principal--sombre { color: var(--blanc); }
.principal--sombre .principal__famille { color: var(--mi-clair); }

/* Bouton (composant Figma « Bouton », 05-composants.css). */
.btn { display: inline-flex; align-items: flex-end; background: var(--primaire); color: var(--blanc); border-radius: 58px; }
.btn__pilule { display: inline-flex; align-items: center; height: 75px; padding: 2px 35px; box-sizing: border-box; font: 600 20px/2.15 var(--titres); white-space: nowrap; }
.btn__cercle svg { display: block; width: 75px; height: 75px; }

/* Adresse du site : pilule sombre, petite capitale espacée des étiquettes. */
.adresse { display: inline-flex; align-items: center; height: 75px; padding: 2px 35px; box-sizing: border-box; background: var(--noir); color: var(--blanc); border-radius: 999px; font: 600 20px/1 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }

/* Titre de section (.h2, 02-base.css), encre du thème clair ou sombre de GitHub. */
.titre { display: inline-block; margin: 0; font: 600 40px/1.25 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }
.titre--clair { color: var(--noir); }
.titre--sombre { color: var(--blanc); }

/* Carte de projet (page Projets, 05-composants.css). */
.carte { position: relative; display: block; width: 1376px; height: 256px; border-radius: var(--rayon); overflow: hidden; }
.carte img { display: block; width: 100%; height: 100%; object-fit: cover; }
.carte__etiquette { position: absolute; left: 16px; bottom: 4.3%; display: flex; flex-direction: column; gap: 9px; padding: 10px; background: var(--blanc); border-radius: var(--rayon); color: var(--encre); }
.carte__nom { font: 600 40px/1.25 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; white-space: nowrap; }
.carte__meta { display: flex; flex-direction: column; font-size: 20px; line-height: 1.45; }
`;

  const page = (corps) => `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>${corps}</body></html>`;

  const principal = ['clair', 'sombre'].map((theme) => ({
    nom: theme === 'clair' ? 'titre-principal' : 'titre-principal-sombre',
    echelle: 2,
    html: page(`<div id="rendu" class="principal principal--${theme}">
  <h1 class="principal__nom"><span class="principal__prenom">${esc(site.prenom)}</span><span class="principal__famille">${esc(site.nomFamille)}</span></h1>
  <p class="principal__role">${riche(site.accueil.hero.sousTitre)}</p>
</div>`),
  }));

  const cercle = icone('cercle-fleche');
  const boutons = Object.entries({
    'bouton-portfolio': 'Visiter mon portfolio',
    'bouton-projets': site.accueil.creations.bouton.label,
    'bouton-template': 'Voir le template',
    'bouton-contact': site.accueil.discute.bouton.label,
  }).map(([nom, label]) => ({
    nom,
    echelle: 2,
    html: page(`<span id="rendu" class="btn"><span class="btn__pilule">${esc(label)}</span><span class="btn__cercle">${cercle}</span></span>`),
  }));

  const adresse = {
    nom: 'adresse-portfolio',
    echelle: 2,
    html: page(`<span id="rendu" class="adresse">${esc(new URL(config.siteUrl).host)}</span>`),
  };

  const titres = Object.entries({
    'titre-a-propos': 'À [[propos]]',
    'titre-projets': site.accueil.creations.titre,
    'titre-template': 'Mon [[template]] web IA',
    'titre-discute': site.accueil.discute.titre,
  }).flatMap(([nom, contenu]) =>
    ['clair', 'sombre'].map((theme) => ({
      nom: theme === 'clair' ? nom : `${nom}-sombre`,
      echelle: 2,
      html: page(`<p id="rendu" class="titre titre--${theme}">${riche(contenu)}</p>`),
    })),
  );

  const cartes = projets.map(({ slug, carte }) => ({
    nom: `projet-${slug}`,
    echelle: 1.3,
    html: page(`<div id="rendu" class="carte">
  <img src="${url('images', carte.image)}" alt="" style="object-position: ${esc(carte.position ?? '50% 50%')}">
  <span class="carte__etiquette"><span class="carte__nom">${esc(carte.label)}</span><span class="carte__meta"><span>${esc(carte.type)}</span><span>${esc(carte.annee)}</span></span></span>
</div>`),
  }));

  return [...principal, ...boutons, adresse, ...titres, ...cartes];
}
