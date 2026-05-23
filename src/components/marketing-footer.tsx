import { Link } from '@tanstack/react-router'

export function MarketingFooter() {
  return (
    <footer className="ink-glow text-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-20 pb-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <span className="font-serif text-2xl font-semibold">ADC <span className="em-serif">Paie</span></span>
            </div>
            <p className="font-serif italic text-lg text-n-300 max-w-md leading-relaxed">
              « Le digital au service des peuples. » Une plateforme conçue à Grand-Bassam pour les PME ivoiriennes.
            </p>
            <div className="mt-10 pt-8 border-t border-white/15 max-w-md">
              <p className="text-sm text-n-300 leading-relaxed">
                <span className="block font-semibold text-white mb-1">African Digit Consulting</span>
                Siti Dia, Grand-Bassam Monckey-ville<br />
                Sud-Comoé, Côte d'Ivoire
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 mb-4 font-semibold">Produit</p>
              <ul className="space-y-3 text-sm">
                <li><Link to="/" hash="features" className="text-white hover:text-orange transition-colors">Fonctionnalités</Link></li>
                <li><Link to="/" hash="pricing" className="text-white hover:text-orange transition-colors">Tarifs</Link></li>
                <li><Link to="/signup" className="text-white hover:text-orange transition-colors">Créer un compte</Link></li>
                <li><Link to="/a-propos" className="text-white hover:text-orange transition-colors">À propos</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 mb-4 font-semibold">Outils & légal</p>
              <ul className="space-y-3 text-sm">
                <li><Link to="/calculatrice" className="text-white hover:text-orange transition-colors">Calculatrice paie</Link></li>
                <li><Link to="/aide" className="text-white hover:text-orange transition-colors">Aide & barèmes</Link></li>
                <li><Link to="/mentions-legales" className="text-white hover:text-orange transition-colors">Mentions légales</Link></li>
                <li><Link to="/cgv" className="text-white hover:text-orange transition-colors">CGV</Link></li>
                <li><Link to="/confidentialite" className="text-white hover:text-orange transition-colors">Confidentialité</Link></li>
              </ul>
            </div>
            <div>
              <p className="text-[10px] tracking-[0.22em] uppercase text-n-400 mb-4 font-semibold">Contact</p>
              <ul className="space-y-3 text-sm">
                <li><a href="mailto:africandigitconsulting@gmail.com" className="text-white hover:text-orange transition-colors break-all">africandigitconsulting@gmail.com</a></li>
                <li><a href="tel:+22527327975 23" className="text-white hover:text-orange transition-colors">+225 27 32 79 75 23</a></li>
                <li><a href="https://africandigitconsulting.com" target="_blank" rel="noreferrer" className="text-white hover:text-orange transition-colors">africandigitconsulting.com</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/15 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <p className="font-serif text-[clamp(3rem,10vw,7rem)] leading-none tracking-tighter text-white">ADC <span className="em-serif" style={{color:'var(--color-orange)'}}>Paie</span></p>
          </div>
          <div className="flex flex-col md:items-end gap-3">
            <p className="text-[11px] tracking-wider uppercase text-n-400">© {new Date().getFullYear()} African Digit Consulting · Tous droits réservés</p>
            <p className="font-serif italic text-xs text-n-400">Document de prospection · maquette publique</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
