import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';

interface TimelineMilestone {
  year: string;
  title: string;
  description: string;
  imageSrc: string;
  imageLabel: string;
}

interface Pillar {
  title: string;
  description: string;
  iconPath: string;
}

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly founderImageSrc = 'founder-renganathan.jpg';
  readonly founderImageLoaded = signal(false);
  readonly milestoneImagesLoaded = signal<Record<string, boolean>>({});

  readonly milestones: TimelineMilestone[] = [
    {
      year: '2016',
      title: 'A Humble Beginning',
      imageSrc: 'timeline-2016-pooja.jpg',
      imageLabel: 'Pooja Essentials',
      description:
        'We started our journey focused strictly on the authentic reselling of daily pooja necessities. Our foundational goal was simple: ensure local families had access to pure, unadulterated ceremonial items for their sacred spaces.',
    },
    {
      year: '2019',
      title: 'Branching into Herbal Wellness',
      imageSrc: 'timeline-2019-herbal.jpg',
      imageLabel: 'Herbal Wellness',
      description:
        'Driven by our community\'s need for natural lifestyles, we expanded our catalog to include premium natural herbs, traditional Ayurvedic formulations, and herbal healthcare products. We partnered with trusted, certified wellness names to offer premium items like Annai Aravind Chooranams, Aadathodai Podi, and Kaadhi Kraft Sandal Soaps.',
    },
    {
      year: 'Sept 2024',
      title: 'The Landmark Expansion',
      imageSrc: 'timeline-2024-brassware.jpg',
      imageLabel: 'Brassware & Decor',
      description:
        'To offer a truly complete spiritual experience, we launched our highly anticipated collection of handcrafted Pooja Brassware, sacred Vasthirams (deity clothing), and elegant God decoration items. This milestone allows families to beautifully adorn their home shrines with heirloom-quality brass idols and custom vestments.',
    },
  ];

  readonly pillars: Pillar[] = [
    {
      title: 'Absolute Purity (Suddhi)',
      description:
        'We maintain a strict verification process for all materials. From our prayer oils to our wellness powders, everything is kept free from synthetic adulterants.',
      iconPath:
        'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    },
    {
      title: 'Authentic Sourcing',
      description:
        'We source our herbal health and beauty products directly from licensed, quality-driven partners, ensuring you receive true holistic benefits.',
      iconPath:
        'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064',
    },
    {
      title: 'Preserving Craftsmanship',
      description:
        'Our premium brass decor and deity ornaments are created by skilled regional artisans, keeping traditional casting and textile arts alive.',
      iconPath:
        'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    },
    {
      title: 'Flawless Customer Care',
      description:
        'From carefully packing fragile brass idols to shipping natural herbs securely, we ensure your sacred items arrive in pristine condition.',
      iconPath:
        'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    },
  ];

  ngOnInit(): void {
    this.title.setTitle('About Us | Sri Renga Traders');
    this.meta.updateTag({
      name: 'description',
      content:
        'Discover Sri Renga Traders — rooted in Srirangam, Trichy, offering pure pooja essentials, natural herbal wellness, and premium sacred brassware with devotion since 2016.',
    });
  }

  onFounderImageLoad(): void {
    this.founderImageLoaded.set(true);
  }

  onFounderImageError(): void {
    this.founderImageLoaded.set(false);
  }

  isMilestoneImageLoaded(year: string): boolean {
    return this.milestoneImagesLoaded()[year] === true;
  }

  onMilestoneImageLoad(year: string): void {
    this.milestoneImagesLoaded.update((state) => ({ ...state, [year]: true }));
  }

  onMilestoneImageError(year: string): void {
    this.milestoneImagesLoaded.update((state) => ({ ...state, [year]: false }));
  }
}
