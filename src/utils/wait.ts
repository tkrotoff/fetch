// https://gist.github.com/tkrotoff/c6dd1cabf5570906724097c6e3f65a12
export function wait(ms: number) {
  return new Promise<void>(resolve => {
    setTimeout(resolve, ms);
  });
}
