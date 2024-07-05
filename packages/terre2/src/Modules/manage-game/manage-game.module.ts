import { Module } from '@nestjs/common';
import { ManageGameService } from './manage-game.service';
import { WebgalFsModule } from '../webgal-fs/webgal-fs.module';
import { ManageGameController } from './manage-game.controller';
import { LspModule } from '../lsp/lsp.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [WebgalFsModule, LspModule, HttpModule],
  providers: [ManageGameService],
  controllers: [ManageGameController],
})
export class ManageGameModule {}
