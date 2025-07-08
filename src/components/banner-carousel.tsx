'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { mockBanners } from '@/lib/mock-data';
import Autoplay from "embla-carousel-autoplay"

export function BannerCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  )
    
  return (
    <Carousel
      className="w-full"
      opts={{
        align: 'start',
        loop: true,
      }}
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
    >
      <CarouselContent>
        {mockBanners.map((banner) => (
          <CarouselItem key={banner.id}>
            <div className="p-1">
              <Card className="overflow-hidden">
                <CardContent className="relative flex aspect-[3/1] items-center justify-center p-0">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover opacity-30"
                    data-ai-hint="cosmetics promotion"
                  />
                  <div className="relative z-10 text-center p-6 flex flex-col items-center gap-4">
                    <h3 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                      {banner.title}
                    </h3>
                    <p className="max-w-xl text-muted-foreground">{banner.description}</p>
                    <Button asChild size="lg">
                      <Link href={banner.linkUrl}>{banner.buttonText}</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
      <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-20 hidden sm:flex" />
    </Carousel>
  );
}
