import { OverlayRef, Overlay, ConnectedPosition } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { PopoverService } from './popover.service';

@Directive({
  selector: '[popoverTrigger]',
})
export class PopoverDirective {
  @Input() popoverTrigger!: TemplateRef<object>;

  @Input() closeOnClickOutside: boolean = false;

  private unsubscribe = new Subject();
  private overlayRef!: OverlayRef;

  constructor(
    private elementRef: ElementRef,
    private overlay: Overlay,
    private vcr: ViewContainerRef,
    private popoverService: PopoverService,
  ) {}

  ngOnInit(): void {
    this.createOverlay();
    this.popoverService.getState().subscribe((resp) => {
      if (resp) {
        this.detachOverlay();
      }
    });
  }

  ngOnDestroy(): void {
    this.detachOverlay();
    this.unsubscribe.next(0);
    this.unsubscribe.complete();
  }

  @HostListener('click') clickou() {
    this.attachOverlay();
  }

  private createOverlay(): void {
    const scrollStrategy = this.overlay.scrollStrategies.block();
    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.elementRef)
      .withPositions([
        {
          // here, top-left of the overlay is connected to bottom-left of the origin;
          // of course, you can change this object or generate it dynamically;
          // moreover, you can specify multiple objects in this array for CDK to find the most suitable option
          originX: 'end',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'top',
        } as ConnectedPosition,
      ])
      .withPush(false);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy,
      hasBackdrop: true,
      backdropClass: '',
    });

    this.overlayRef
      .backdropClick()
      .pipe(takeUntil(this.unsubscribe))
      .subscribe(() => {
        if (this.closeOnClickOutside) {
          this.detachOverlay();
        }
      });
  }

  private attachOverlay(): void {
    if (!this.overlayRef.hasAttached()) {
      const periodSelectorPortal = new TemplatePortal(
        this.popoverTrigger,
        this.vcr,
      );

      this.overlayRef.attach(periodSelectorPortal);
    }
  }

  private detachOverlay(): void {
    if (this.overlayRef.hasAttached()) {
      this.overlayRef.detach();
    }
  }
}
