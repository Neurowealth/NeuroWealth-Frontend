'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useI18n } from '@/contexts/I18nContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqCategoryIds: Record<string, string> = {
  'connect-wallet': 'gettingStarted',
  'what-is-neurowealth': 'gettingStarted',
  'wallet-security': 'security',
  'forgot-password': 'security',
  'transaction-slow': 'transactions',
  'gas-fees': 'transactions',
  'check-transaction-status': 'transactions',
  'supported-tokens': 'assets',
  'add-custom-token': 'assets',
  'staking-basics': 'staking',
  'staking-rewards': 'staking',
  'contact-support': 'support',
};

const categories = ['all', 'gettingStarted', 'security', 'transactions', 'assets', 'staking', 'support'] as const;

export default function FAQSection() {
  const { messages } = useI18n();
  const t = messages.help.faq;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const faqData: FAQItem[] = useMemo(
    () =>
      t.items.map((item) => ({
        id: item.id,
        question: item.q,
        answer: item.a,
        category: faqCategoryIds[item.id],
      })),
    [t.items],
  );

  const filteredFAQs = useMemo(() => {
    return faqData.filter(faq => {
      const matchesSearch = searchTerm === '' || 
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqData, searchTerm, selectedCategory]);

  const toggleExpanded = (id: string) => {
    setExpandedItems((prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <div className="space-y-4">
          <div>
            <label htmlFor="faq-search" className="block text-sm font-medium text-slate-300 mb-2">
              {t.searchLabel}
            </label>
            <input
              id="faq-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label={t.searchAria}
            />
          </div>
          
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-slate-300 mb-2">
              {t.filterLabel}
            </label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              aria-label={t.filterAria}
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-dark-800">
                  {t.categories[category]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-slate-400">
        {t.found} {filteredFAQs.length} {filteredFAQs.length === 1 ? t.faqSingular : t.faqPlural}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-slate-400">{t.noResults}</p>
              <p className="text-slate-500 text-sm mt-2">{t.noResultsHint}</p>
            </div>
          </Card>
        ) : (
          filteredFAQs.map((faq: FAQItem) => (
            <Card key={faq.id} className="overflow-hidden">
              <button
                onClick={() => toggleExpanded(faq.id)}
                onKeyDown={(e) => handleKeyDown(e, faq.id)}
                className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-inset rounded-xl transition-all duration-200 hover:bg-white/5"
                aria-expanded={expandedItems.has(faq.id)}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/20 text-green-400 font-medium">
                        {t.categories[faq.category as keyof typeof t.categories]}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${
                        expandedItems.has(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </button>
              
              <div
                id={`faq-answer-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  expandedItems.has(faq.id) ? 'max-h-96' : 'max-h-0'
                }`}
                aria-hidden={!expandedItems.has(faq.id)}
              >
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-white/10 pt-4">
                    <p className="text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
