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
  --rayon: 10px;
  --gouttiere: 31.68px;
  --sans: 'Noto Sans', sans-serif;
  --titres: 'Manrope', 'Noto Sans', sans-serif;
  --mono: 'Rubik Mono One', 'Noto Sans', sans-serif;
}
html, body { margin: 0; background: transparent; }
body { font-family: var(--sans); color: var(--noir); -webkit-font-smoothing: antialiased; }
.em { font-family: var(--mono); font-style: normal; font-weight: 400; font-size: 1.075em; letter-spacing: 0; line-height: 1.25; }
.souligne { position: relative; display: inline-block; }
.trait { position: absolute; left: 0; top: calc(100% + 2px); width: 100%; height: 16px; overflow: visible; }

/* Bannière : héros de l'accueil (06-accueil.css) à 1440 px, photo de 680 × 628
   centrée entre le bas de l'en-tête (81 px) et le bas de la bannière. */
.banniere { --haut-photo: 121.5px; --hauteur: 790px; position: relative; width: 1440px; height: var(--hauteur); background: var(--blanc); border-radius: 16px; overflow: hidden; }
.banniere__logo { position: absolute; top: calc(14px + (67px - 34px) / 2); left: calc(var(--gouttiere) + 22px); }
.banniere__logo svg { display: block; width: auto; height: 34px; }
.banniere__credit { position: absolute; margin: 0; right: var(--gouttiere); bottom: calc(var(--hauteur) - var(--haut-photo) + 10px); font: 600 13px/1.4 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; color: color-mix(in srgb, var(--noir) 72%, transparent); }
.banniere__photo { position: absolute; top: var(--haut-photo); right: var(--gouttiere); width: 680px; height: 628px; border-radius: var(--rayon); overflow: hidden; }
.banniere__photo img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0%; }
.banniere__nom { position: absolute; margin: 0; top: calc(var(--haut-photo) + 256px); left: var(--gouttiere); font: 700 150px/119px var(--sans); }
.banniere__prenom, .banniere__famille { display: block; }
.banniere__prenom { color: var(--primaire); }
.banniere__famille { color: var(--mi); margin-top: 41px; padding-left: 7px; }
.banniere__role { position: absolute; margin: 0; top: calc(var(--haut-photo) + 568px); left: var(--gouttiere); right: var(--gouttiere); font: 600 40px/1.25 var(--titres); letter-spacing: 0.11em; text-transform: uppercase; isolation: isolate; }
.banniere__role-texte { position: relative; display: inline-block; }
.banniere__role-texte::before { content: ''; position: absolute; z-index: -1; top: -33px; bottom: -32px; left: 0; width: calc(100% + 40px); background: var(--blanc); border-radius: 0 var(--rayon) 0 0; }

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

  const { hero } = site.accueil;
  const banniere = {
    nom: 'banniere',
    echelle: 1.25,
    html: page(`<div id="rendu" class="banniere">
  <span class="banniere__logo">${icone('logo-kg')}</span>
  <p class="banniere__credit">${esc(hero.credit)}</p>
  <div class="banniere__photo"><img src="${url('images', hero.image)}" alt=""></div>
  <h1 class="banniere__nom"><span class="banniere__prenom">${esc(site.prenom)}</span><span class="banniere__famille">${esc(site.nomFamille)}</span></h1>
  <p class="banniere__role"><span class="banniere__role-texte">${riche(hero.sousTitre)}</span></p>
</div>`),
  };

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

  return [banniere, ...boutons, adresse, ...titres, ...cartes];
}
