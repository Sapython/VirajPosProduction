export interface Charge {
  delivery: {
    allowed: boolean;
    byDefault: boolean;
    fixed: boolean;
    charges?: number;
  };
  tip: {
    allowed: boolean;
    byDefault: boolean;
    fixed: boolean;
    charges?: number;
  };
  container: {
    allowed: boolean;
    byDefault: boolean;
    fixed: boolean;
    charges?: number;
  };
  service: {
    allowed: boolean;
    byDefault: boolean;
    fixed: boolean;
    charges?: number;
  };
}
