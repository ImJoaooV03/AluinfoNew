import React from 'react';
import { Mail, Phone, MapPin, Linkedin, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegion } from '../contexts/RegionContext';

const Footer = () => {
  const { region, t } = useRegion();

  return (
    <footer className="bg-dark-footer text-gray-400 text-sm font-sans mt-12 border-t border-gray-800">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Column 1: Brand & Contact */}
        <div>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded flex items-center justify-center text-white font-bold">A</div>
                <span className="text-xl font-bold text-white">ALUINFO</span>
            </div>
            <p className="text-xs mb-6 leading-relaxed">
                {t('portalDescription')}
            </p>
            <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
                    <Mail size={14} className="text-primary" /> adm@aluinfo.com
                </div>
                <div className="flex items-center gap-2 hover:text-primary cursor-pointer">
                    <Phone size={14} className="text-primary" /> +55 47 99631-2867
                </div>
                <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" /> Santa Catarina, Brasil
                </div>
            </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
            <h3 className="text-white font-bold mb-4">{t('quickLinks')}</h3>
            <ul className="space-y-2 text-xs">
                <li><Link to={`/${region}/anuncie`} className="hover:text-primary transition-colors">{t('advertise')}</Link></li>
                <li><Link to={`/${region}/anuncie`} className="hover:text-primary transition-colors">Mídia Kit</Link></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('contact')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('privacyPolicy')}</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">{t('termsOfUse')}</a></li>
            </ul>
        </div>

        {/* Column 3: Services */}
        <div>
            <h3 className="text-white font-bold mb-4">{t('services')}</h3>
            <ul className="space-y-2 text-xs">
                <li><Link to={`/${region}/fornecedores`} className="hover:text-primary transition-colors">{t('suppliers')}</Link></li>
                <li><Link to={`/${region}/fundicoes`} className="hover:text-primary transition-colors">{t('foundries')}</Link></li>
                <li><Link to={`/${region}/artigos-tecnicos`} className="hover:text-primary transition-colors">{t('technical')}</Link></li>
            </ul>
        </div>

        {/* Column 4: Education & News */}
        <div>
            <h3 className="text-white font-bold mb-4">{t('education')}</h3>
            <ul className="space-y-2 text-xs mb-6">
                <li><a href="#" className="hover:text-primary transition-colors">{t('courses')}</a></li>
                <li><Link to={`/${region}/ebooks`} className="hover:text-primary transition-colors">{t('ebooks')}</Link></li>
            </ul>
            
            <h3 className="text-white font-bold mb-4">{t('news')}</h3>
            <ul className="space-y-2 text-xs">
                 <li><Link to={`/${region}/noticias`} className="hover:text-primary transition-colors">{t('market')}</Link></li>
                 <li><Link to={`/${region}/noticias`} className="hover:text-primary transition-colors">{t('analysis')}</Link></li>
                 <li><Link to={`/${region}/noticias`} className="hover:text-primary transition-colors">{t('quotes')}</Link></li>
                 <li><Link to={`/${region}/noticias`} className="hover:text-primary transition-colors">{t('reports')}</Link></li>
            </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-[#151922] py-6 border-t border-gray-800">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-[10px] text-gray-500">
                © 2025 ALUINFO. {t('allRightsReserved')}
            </div>
            <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/portal.aluinfo" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white"><Instagram size={16} /></a>
                <a href="https://www.linkedin.com/in/portal-aluinfo-231955374/" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white"><Linkedin size={16} /></a>
            </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
