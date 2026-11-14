// {{TITULO}} — app com o Astryx original (sem o visual Astryx-NEXT).
// Para passar a usar o visual mais tarde, ver README.md.
import { Button, Card, Heading, Text, VStack } from '@astryxdesign/core';

export default function App() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: 24 }}>
      <Card padding={6}>
        <VStack gap={3}>
          <Heading level={1}>{'{{TITULO}}'}</Heading>
          <Text type="supporting">App criada com o Astryx (tema neutral), sem o visual Astryx-NEXT.</Text>
          <Button variant="primary" label="Começar" />
        </VStack>
      </Card>
    </main>
  );
}
