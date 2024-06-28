import type { Signal } from "@preact/signals";
import { Button } from "../components/Button.tsx";
import { get_greeting } from "$gleam/lib/greet.mjs";

interface CounterProps {
  count: Signal<number>;
}

export default function Counter(props: CounterProps) {
  const greeting = get_greeting("Hello from Gleam! (but on the client side)");

  return (
    <div class="border p-4 rounded w-full flex flex-col justify-center items-center">
      <div class="flex gap-8 py-6">
        <Button onClick={() => props.count.value -= 1}>-1</Button>
        <p class="text-3xl tabular-nums">{props.count}</p>
        <Button onClick={() => props.count.value += 1}>+1</Button>
      </div>
      <p class="text-3xl">{greeting}</p>
    </div>
  );
}
