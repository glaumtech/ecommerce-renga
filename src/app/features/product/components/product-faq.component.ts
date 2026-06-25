import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-product-faq',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
      <h2 class="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>

      <div class="space-y-3">
        @for (faq of faqs; track faq.question; let i = $index) {
          <div class="border border-slate-200 rounded-lg overflow-hidden">
            <button
              type="button"
              (click)="toggle(i)"
              class="w-full flex items-center justify-between p-4 text-left font-medium text-slate-800 hover:bg-slate-50 transition-colors"
            >
              {{ faq.question }}
              <span class="text-orange-600 text-xl leading-none">{{ openIndex() === i ? '−' : '+' }}</span>
            </button>
            @if (openIndex() === i) {
              <div class="px-4 pb-4 text-sm text-slate-600 leading-relaxed">{{ faq.answer }}</div>
            }
          </div>
        }
      </div>

      <div class="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-lg text-center">
        <p class="text-sm text-slate-700 mb-3">Still have questions?</p>
        <a href="mailto:support@ananda.store" class="text-orange-600 font-semibold text-sm hover:text-orange-700">
          Contact Support →
        </a>
      </div>
    </div>
  `,
})
export class ProductFaqComponent {
  readonly openIndex = signal<number | null>(0);

  readonly faqs: FaqItem[] = [
    {
      question: 'How long does delivery take?',
      answer: 'Standard delivery takes 3–7 business days across India. Metro cities may receive orders sooner.',
    },
    {
      question: 'Are these products authentic?',
      answer: 'Yes. All spiritual and herbal products are sourced from verified suppliers and quality-checked before dispatch.',
    },
    {
      question: 'What is your return policy?',
      answer: 'Unopened items can be returned within 7 days of delivery. Contact support to initiate a return.',
    },
    {
      question: 'Do you ship internationally?',
      answer: 'Currently we ship within India only. International shipping will be available soon.',
    },
  ];

  toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
