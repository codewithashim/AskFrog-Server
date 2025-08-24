import { Module } from '@nestjs/common';
import { GeminiService } from './services/gemini.service';
import { PineconeService } from './services/pinecone.service';
import { AIOrchestratorService } from './services/ai-orchestrator.service';

@Module({
  providers: [GeminiService, PineconeService, AIOrchestratorService],
  exports: [GeminiService, PineconeService, AIOrchestratorService],
})
export class AIModule {}
