import { ViewProvider, useView } from './view.jsx';
import PixelApp from './pixel/PixelApp.jsx';
import ClassicApp from './classic/ClassicApp.jsx';

function CurrentView() {
  const { view } = useView();
  return view === 'classic' ? <ClassicApp /> : <PixelApp />;
}

export default function Root() {
  return (
    <ViewProvider>
      <CurrentView />
    </ViewProvider>
  );
}
