type Instance = Record<never, unknown>;
type Constructor<I extends Instance = Instance> = new (...args: any[]) => I;
type Trait<C extends Instance = never, T extends Constructor = Constructor> = <Base extends Constructor<C>>(
  base: Base
) => Base & T;

declare const traitConstraintSymbol: unique symbol;
type BrandTrait<C extends Instance = Instance, T extends Trait<C, Constructor> = Trait> = T & {
  [traitConstraintSymbol]: C;
};

function defineTrait<C extends Instance>() {
  return {
    impl<R extends Trait<C, Constructor>>(trait: R) {
      return trait as BrandTrait<C, R>;
    },
  };
}

type InferTraitConstraint<T extends BrandTrait> = T[typeof traitConstraintSymbol];
type TraitInstance<T extends Trait<never, Constructor>> = InstanceType<ReturnType<T>>;
type TraitCompatible<T extends BrandTrait, Base extends Instance> = Base extends InferTraitConstraint<T>
  ? T
  : Trait<Base>;
type AssertTraits<T extends Array<BrandTrait>, Base extends Instance> = T extends [
  infer FT extends BrandTrait,
  ...infer Rest extends Array<BrandTrait>
]
  ? [TraitCompatible<FT, Base>, ...AssertTraits<Rest, Base & TraitInstance<TraitCompatible<FT, Base>>>]
  : T;
type CombineTraitInstance<T extends Array<Trait>> = T extends [
  infer F extends Trait,
  ...infer R extends Array<Trait>
]
  ? ReturnType<F> & CombineTraitInstance<R>
  : unknown;

function make<Base extends Constructor, T extends Array<BrandTrait>>(
  base: Base,
  ...traits: AssertTraits<T, InstanceType<Base>>
) {
  return traits.reduce((acc, trait) => trait(acc as never), base) as Base & CombineTraitInstance<T>;
}

export { defineTrait, make };
