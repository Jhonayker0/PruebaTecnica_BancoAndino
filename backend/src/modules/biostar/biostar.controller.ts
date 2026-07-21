import { Body, Controller, Post } from '@nestjs/common';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthLogoutDto } from './dto/auth-logout.dto';
import { SyncDoorDto } from './dto/sync-door.dto';
import { SyncUserDto } from './dto/sync-user.dto';
import { BiostarService } from './biostar.service';

@Controller('biostar')
export class BiostarController {
  constructor(private readonly biostarService: BiostarService) {}

  @Post('auth/login')
  login(@Body() payload: AuthLoginDto) {
    return this.biostarService.login(payload);
  }

  @Post('auth/logout')
  logout(@Body() payload: AuthLogoutDto) {
    return this.biostarService.logout(payload);
  }

  @Post('users/create')
  createUser(@Body() payload: SyncUserDto) {
    return this.biostarService.createUser(payload);
  }

  @Post('users/update')
  updateUser(@Body() payload: SyncUserDto) {
    return this.biostarService.updateUser(payload);
  }

  @Post('doors/create')
  createDoor(@Body() payload: SyncDoorDto) {
    return this.biostarService.createDoor(payload);
  }

  @Post('doors/update')
  updateDoor(@Body() payload: SyncDoorDto) {
    return this.biostarService.updateDoor(payload);
  }

  @Post('sync')
  syncAll() {
    return this.biostarService.syncAll();
  }
}
